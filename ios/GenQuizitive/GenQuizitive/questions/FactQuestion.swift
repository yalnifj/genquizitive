//
//  FactQuestion.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/28/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class FactQuestion : MultipleChoiceQuestion {
    var fact:Fact?
    
    override init() {
        super.init()
        self.name  = "fact"
        self.letter = "F"
        self.background = "fact_background.jpg"
        self.hints = ["fifty","lifesaver","freeze","skip","rollback"]
        self.answerPeople = [Person]()
        self.person = nil
        self.fact = nil
    }
    
    override func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?) -> Void) {
        self.difficulty = difficulty
        self.questionText = ""
        let familyTreeService = FamilyTreeService.getInstance()
        self.person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)
        //-- make sure we have a person with facts
        var counter = 0
        while(counter < 20 && self.person!.facts.count < 2) {
            self.person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)
            counter += 1
        }
        if counter >= 20 {
            onCompletion(self, NSError(domain: "FactQuestion", code: 404, userInfo: ["message":"Unable to find a person with facts"]))
            return
        }
        if person != nil {
            self.person = person
            familyTreeService.markUsed(personId: person!.id!)
            familyTreeService.getRandomPeopleNear(person: person!, num: 3, useLiving: useLiving, ignoreGender: true, onCompletion: {people, err in
                if people != nil {
                    for p in people! {
                        self.answerPeople.append(p)
                    }
                    
                    let languageService = LanguageService.getInstance()
                    var found = false
                    var count = 0
                    while(!found && count < 10) {
                        let r = Int(arc4random_uniform(UInt32(self.person!.facts.count)))
                        self.fact = self.person!.facts[r];
                        var good = true
                        if (self.fact!.date == nil && self.fact!.place == nil) {
                            good = false
                            count += 1
                        }
                        if (good && languageService.facts[self.fact!.type!] != nil && languageService.facts[self.fact!.type!]?.pastVerb != nil) {
                            found = true
                            //-- check for a matching fact
                            for rperson in self.answerPeople {

                                    for ofact in rperson.facts {
                                        if (ofact.type == self.fact!.type) {
                                            var yearMatch = false
                                            var placeMatch = false
                                            if (ofact.date == nil && self.fact!.date == nil) {
                                                yearMatch = true
                                            } else if (ofact.date != nil && self.fact!.date != nil) {
                                                if (languageService.getDateYear(date: ofact.date!.original!) == languageService.getDateYear(date: self.fact!.date!.original!)) {
                                                    yearMatch = true
                                                }
                                            }
                                            if yearMatch {
                                                if (ofact.place == nil && self.fact!.place == nil) {
                                                    placeMatch = true;
                                                } else if (ofact.place != nil && self.fact!.place != nil) {
                                                    if (ofact.place!.original == self.fact!.place!.original) {
                                                        placeMatch = true
                                                    }
                                                }
                                            }
                                            if yearMatch && placeMatch {
                                                found = false
                                                break
                                            }
                                        }
                                    
                                }
                                if !found {
                                    break
                                }
                            }
                            count += 1
                        }
                    }
                    
                    if (self.fact != nil) {
                        let factLang = languageService.facts[self.fact!.type!]!
                        self.questionText = "Who \(factLang.pastVerb!)"
                        if (self.fact!.value != nil) {
                            self.questionText = self.questionText.appending(" \(self.fact!.value!)")
                        }
                        if (self.fact!.place != nil && self.fact!.place!.original != nil) {
                            self.questionText = self.questionText.appending(" in \(self.fact!.place!.original!)")
                        }
                        if (self.fact!.date != nil && self.fact!.date!.original != nil) {
                            if (self.fact!.date!.original!.characters.count > 4) {
                                self.questionText = self.questionText.appending(" on \(self.fact!.date!.original!)")
                            } else {
                                self.questionText = self.questionText.appending(" in \(self.fact!.date!.original!)")
                            }
                        }
                        self.questionText = self.questionText.appending("?")
                        
                        self.isReady = true
                    } else {
                        let error = NSError(domain: "FactQuestion", code: 404, userInfo: ["message":"Not enough facts for person \(self.person!.id)"])
                        onCompletion(self, error)
                    }
                    
                    onCompletion(self, nil)
                } else {
                    onCompletion(self, err)
                }
            })
        } else {
            let error = NSError(domain: "FactQuestion", code: 404, userInfo: ["message":"Unable to find a person with facts"])
            onCompletion(self, error)
        }
    }
}

class FactQuestionView : UIView {
    
    var view:UIView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var questionTextShadow: UIView!
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
        
        questionText.layer.cornerRadius = 20
        questionText.clipsToBounds = true
        
        questionTextShadow.layer.cornerRadius = 20
        questionTextShadow.clipsToBounds = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "FactQuestion", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showQuestion(question:FactQuestion) {
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
