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
    var facts:[Fact]?
    
    override init() {
        super.init()
        self.name  = "timeline"
        self.letter = "L"
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
        self.facts = self.filterFacts(facts: person.facts)
        while(counter < 10 && (self.facts!.count < min)) {
            person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)!
            if person.facts.count > self.facts!.count {
                self.person = person
                self.facts = self.filterFacts(facts: person.facts)
            }
            counter += 1
        }
        if counter >= 10 {
            onCompletion(self, NSError(domain: "FactQuestion", code: 404, userInfo: ["message":"Unable to find a person with facts"]))
            return
        } else {
            self.questionText = "Place the facts for \(self.person!.display!.name!) in the correct order on the timeline."
            self.isReady = true
            onCompletion(self, nil)
        }
    }
    
    func filterFacts(facts:[Fact]) -> [Fact] {
        var skipFacts = ["http://gedcomx.org/Caste":true,"http://gedcomx.org/Clan":true,"http://gedcomx.org/Ethnicity":true,
                    "http://gedcomx.org/Language":true,"http://gedcomx.org/Living":true,"http://gedcomx.org/NationalId":true,
                    "http://gedcomx.org/Nationality":true,"http://gedcomx.org/NumberOfMarriages":true,
                    "http://gedcomx.org/PhysicalDescription":true,"http://gedcomx.org/Religion":true,
                    "http://gedcomx.org/Residence":true,"http://gedcomx.org/Stillbirth":true,
                    "http://gedcomx.org/NumberOfChildren":true,"http://familysearch.org/v1/TribeName":true]
        var newfacts = [Fact]()
        for fact in facts {
            if skipFacts[fact.type!] == nil {
                newfacts.append(fact)
            }
        }
        return newfacts
    }
}

class TimelineQuestionView : UIView {
    var view:UIView!
    
    @IBOutlet weak var avatarBadge: AvatarBadge!
    @IBOutlet weak var textShadow: UIView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var factScroller: TimelineFactScroller!
    
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
        
        questionText.layer.cornerRadius = 10
        questionText.clipsToBounds = true
        questionText.text = ""
        
        textShadow.layer.cornerRadius = 10
        textShadow.clipsToBounds = true
        textShadow.alpha = 0.7
        
        avatarBadge.isHidden = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "TimelineQuestionView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

    func showQuestion(question:TimelineQuestion) {
        self.question = question
        
        questionText.text = question.questionText
        if question.person != nil {
            FamilyTreeService.getInstance().getPersonPortrait(personId: question.person!.id, onCompletion: {path in
                if path != nil {
                    let fileManager = FileManager.default
                    let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
                    let photoUrl = url.appendingPathComponent(path!)
                    let data = try? Data(contentsOf: photoUrl)
                    if data != nil {
                        let uiImage = UIImage(data: data!)
                        if uiImage != nil {
                            self.avatarBadge.isHidden = false
                            self.avatarBadge.showAncestorBackground()
                            self.avatarBadge.setProfileImage(image: uiImage!)
                        }
                    }
                }
            })
            
            factScroller.showQuestion(question: question)
        }
    }
    
}
