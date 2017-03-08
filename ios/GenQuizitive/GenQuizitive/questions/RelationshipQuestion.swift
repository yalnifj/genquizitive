//
//  RelationshipQuestion.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/3/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class RelationshipQuestion : MultipleChoiceQuestion {
    var path:[Relationship]?
    var relationshipText:String?
    
    override init() {
        super.init()
        self.name  = "relationship"
        self.letter = "R"
        self.background = "r_background.jpg"
        self.hints = ["fifty","lifesaver","freeze","skip","rollback"]
        self.answerPeople = [Person]()
        self.person = nil
    }
    
    override func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?) -> Void) {
        self.difficulty = difficulty
        let length = difficulty + 1
        let familyTreeService = FamilyTreeService.getInstance()
        let relationshipService = RelationshipService.getInstance()
        self.isReady = false
        self.questionText = ""
        
        let results = relationshipService.getRandomRelationshipPath(person: familyTreeService.fsUser!, length: length, useLiving: useLiving)
        self.path = results["path"] as? [Relationship]
        self.person = results["lastPerson"] as? Person
        
        if self.path == nil || self.person == nil || self.person?.id == familyTreeService.fsUser?.id {
            let error = NSError(domain: "RelationshipQuestion", code: 404, userInfo: ["message":"Unable to find a random relationship path"])
            onCompletion(self, error)
            return
        }
        
        relationshipText = relationshipService.verbalizePath(startPerson: familyTreeService.fsUser!, path: path!)
        self.questionText = "Who is your \(relationshipText!)"
        familyTreeService.markUsed(personId: self.person!.id!)
        familyTreeService.getRandomPeopleNear(person: self.person!, num: 3, useLiving: useLiving, ignoreGender: false, onCompletion: {rpeople, err in
            if rpeople != nil {
                for p in rpeople! {
                    self.answerPeople.append(p)
                }
                self.isReady = true
                onCompletion(self, nil)
            } else {
                onCompletion(self, err)
            }
        })
    }
}

class RelationshipQuestionView : UIView {
    
    var view:UIView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var answerBtn1: UIButton!
    @IBOutlet weak var answerBtn2: UIButton!
    @IBOutlet weak var answerBtn3: UIButton!
    @IBOutlet weak var answerBtn4: UIButton!
    @IBOutlet weak var avatar1: AvatarBadge!
    @IBOutlet weak var avatar2: AvatarBadge!
    @IBOutlet weak var avatar3: AvatarBadge!
    @IBOutlet weak var avatar4: AvatarBadge!
    
    var question:RelationshipQuestion!
    var answers = [Person]()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    func setup() {
        view = loadViewFromNib()
        view.frame = bounds
        view.autoresizingMask = UIViewAutoresizing.flexibleWidth
        addSubview(view)
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "FactQuestion", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func loadPersonAvatar(person: Person, num:Int) {
        FamilyTreeService.getInstance().getPersonPortrait(personId: person.id!, onCompletion: { path in
            if path != nil {
                let fileManager = FileManager.default
                let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let photoUrl = url.appendingPathComponent(path!)
                let data = try? Data(contentsOf: photoUrl)
                if data != nil {
                    let uiImage = UIImage(data: data!)
                    if uiImage != nil {
                        var avatar:AvatarBadge? = nil
                        if num == 0  {
                            avatar = self.avatar1
                        } else if num==1 {
                            avatar = self.avatar2
                        } else if num==2 {
                            avatar = self.avatar3
                        } else if num==3 {
                            avatar = self.avatar4
                        }
                        if avatar != nil {
                            avatar?.isHidden = true
                            avatar?.showAncestorBackground()
                            avatar?.setProfileImage(image: uiImage!)
                        }
                        return
                    }
                }
            }
            print("Unable to load data for \(path)")
        })
    }
    
    func showQuestion(question:RelationshipQuestion) {
        self.question = question
        self.questionText.text = question.questionText
        
        answers = [Person]()
        answers.append(question.person!)
        var num = 0
        for p in question.answerPeople {
            answers.append(p)
            loadPersonAvatar(person: p, num: num)
            num += 1
        }
        
        for i in 0..<answers.count {
            let r = Int(arc4random_uniform(UInt32(answers.count)))
            let p = answers[i]
            answers[i] = answers[r]
            answers[r] = p
        }
        
        answerBtn1.setTitle(answers[0].getFullName(), for: .normal)
        if answers.count > 1 {
            answerBtn2.setTitle(answers[1].getFullName(), for: .normal)
        }
        if answers.count > 2 {
            answerBtn3.setTitle(answers[2].getFullName(), for: .normal)
        }
        if answers.count > 3 {
            answerBtn4.setTitle(answers[3].getFullName(), for: .normal)
        }
    }
    
    @IBAction func answerBtn1Click(_ sender: Any) {
        if answers.count > 0 && answers[0].id == question.person!.id {
            print("correct")
            EventHandler.getInstance().publish("questionCorrect", data: question)
        } else {
            print("incorrect")
            answerBtn1.isEnabled = false
            EventHandler.getInstance().publish("questionIncorrect", data: question)
        }
    }
    
    @IBAction func answerBtn2Click(_ sender: Any) {
        if answers.count > 1 && answers[1].id == question.person!.id {
            print("correct")
            EventHandler.getInstance().publish("questionCorrect", data: question)
        } else {
            print("incorrect")
            answerBtn2.isEnabled = false
            EventHandler.getInstance().publish("questionIncorrect", data: question)
        }
    }
    
    @IBAction func answerBtn3Click(_ sender: Any) {
        if answers.count > 2 && answers[2].id == question.person!.id {
            print("correct")
            EventHandler.getInstance().publish("questionCorrect", data: question)
        } else {
            print("incorrect")
            answerBtn3.isEnabled = false
            EventHandler.getInstance().publish("questionIncorrect", data: question)
        }
    }
    
    
    @IBAction func answerBtn4Click(_ sender: Any) {
        if answers.count > 3 && answers[3].id == question.person!.id {
            print("correct")
            EventHandler.getInstance().publish("questionCorrect", data: question)
        } else {
            print("incorrect")
            answerBtn4.isEnabled = false
            EventHandler.getInstance().publish("questionIncorrect", data: question)
        }
    }
    
}
