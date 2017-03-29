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
    var facts:[Fact]?
    
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
            if skipFacts[fact.type!] != nil {
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
    var poleImage: UIImageView?
    @IBOutlet weak var factScroller: UIScrollView!
    
    
    var sortedFacts:[Fact] = [Fact]()
    var facts:[Fact] = [Fact]()
    var timelineFactViews = [TimelineFactView]()
    
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
            
            sortedFacts = LanguageService.getInstance().sortFacts(facts: question.facts!)
            while sortedFacts.count > question.difficulty + 2 {
                sortedFacts.remove(at: sortedFacts.count / 2)
            }
            
            facts = [Fact]()
            for f in sortedFacts {
                facts.append(f)
            }
            
            while checkComplete() {
                for i in 0..<facts.count {
                    let r = Int(arc4random_uniform(UInt32(facts.count)))
                    let p = facts[i]
                    facts[i] = facts[r]
                    facts[r] = p
                }
            }
            
            for tfv in timelineFactViews {
                tfv.removeFromSuperview()
            }
            timelineFactViews.removeAll()
            
            if poleImage != nil {
                poleImage!.removeFromSuperview()
            }
            
            var y = CGFloat(5)
            let ratio = CGFloat(75.0 / 350.0)
            let fh = factScroller.frame.width * ratio
            for fact in facts {
                let frame = CGRect(x: 0, y: y, width: factScroller.frame.width, height: fh)
                let tfv = TimelineFactView(frame: frame)
                tfv.showFact(fact: fact, person: question.person!)
                timelineFactViews.append(tfv)
                factScroller.addSubview(tfv)
                y = y + fh + 3
            }
            
            poleImage = UIImageView(image: UIImage(named: "pole1"))
            poleImage?.frame = CGRect(x: (fh / 2) - 5, y: fh / 2, width: 10, height: y - fh)
            factScroller.insertSubview(poleImage!, at: 0)
        }
    }
    
    func checkComplete() -> Bool {
        var complete = true
        for i in 0..<facts.count {
            if sortedFacts[i].id != facts[i].id {
                complete = false
                break
            }
        }
        return complete
    }
}
