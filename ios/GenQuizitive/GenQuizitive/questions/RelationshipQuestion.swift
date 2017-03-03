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
    }
}

class RelationshipQuestionView : UIView {
    
    var view:UIView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var answerBtn1: UIButton!
    @IBOutlet weak var answerBtn2: UIButton!
    @IBOutlet weak var answerBtn3: UIButton!
    @IBOutlet weak var answerBtn4: UIButton!
    
    var question:FactQuestion!
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
    
    func showQuestion(question:RelationshipQuestion) {
        self.question = question
        self.questionText.text = question.questionText
        
        answers = [Person]()
        answers.append(question.person!)
        for p in question.answerPeople {
            answers.append(p)
            /*
             FamilyTreeService.getInstance().getPersonPortrait(personId: p.id!, onCompletion: { path in
             if path != nil {
             let fileManager = FileManager.default
             let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
             let photoUrl = url.appendingPathComponent(path!)
             let data = try? Data(contentsOf: photoUrl)
             if data != nil {
             let uiImage = UIImage(data: data!)
             if uiImage != nil {
             self.setPhotoImage(photo: uiImage!)
             return
             }
             }
             }
             print("Unable to load data for \(path)")
             })
             */
            
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
