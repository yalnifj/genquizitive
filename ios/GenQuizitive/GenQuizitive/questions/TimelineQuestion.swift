//
//  TimelineView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/9/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class TimelineQuestion : Question {
    var person:Person?
    
    override init() {
        super.init()
        self.name  = "timeline"
        self.letter = "T"
        self.background = "fact_background.jpg"
        self.hints = ["freeze","skip","rollback"]
        self.person = nil
    }
    
    override func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?) -> Void) {
        print("Setting up question \(self.name)")
        self.difficulty = difficulty
        self.isReady = false
        let familyTreeService = FamilyTreeService.getInstance()
        self.person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)
        //-- make sure we have a person with facts
        var counter = 0
        var min = 1 + difficulty
        if min < 3 {
            min = 3
        }
        var person = self.person!
        while(counter < 10 && (self.person!.facts.count < min)) {
            person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)!
            if person.facts.count > self.person!.facts.count {
                self.person = person
            }
            counter += 1
        }
        if counter >= 10 {
            onCompletion(self, NSError(domain: "FactQuestion", code: 404, userInfo: ["message":"Unable to find a person with facts"]))
            return
        } else {
            self.questionText = "Place the facts for \(self.person!.display!.name) in the correct order on the timeline."
            self.isReady = true
            onCompletion(self, nil)
        }
    }
}

class TimelineQuestionView : UIView {
    var view:UIView!
    
    @IBOutlet weak var factContainer: UIView!
    @IBOutlet weak var avatarBadge: AvatarBadge!
    @IBOutlet weak var textShadow: UIView!
    @IBOutlet weak var questionText: UILabel!
    
    var sortedFacts:[Fact]!
    var facts:[Fact]!
    
    var question:TimelineQuestion!
    
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
        questionText.text = ""
        
        textShadow.layer.cornerRadius = 20
        textShadow.clipsToBounds = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "TimelineQuestion", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

    func showQuestion(question:TimelineQuestion) {
        self.question = question
        
        questionText.text = question.questionText
        if question.person != nil {
            sortedFacts = LanguageService.getInstance().sortFacts(facts: question.person!.facts)
            while sortedFacts.count > question.difficulty + 2 {
                sortedFacts.remove(at: sortedFacts.count / 2)
            }
            
            facts = [Fact]()
            for f in sortedFacts {
                facts.append(f)
            }
            
            for i in 0..<facts.count {
                let r = Int(arc4random_uniform(UInt32(facts.count)))
                let p = facts[i]
                facts[i] = facts[r]
                facts[r] = p
            }
        }
    }
}
