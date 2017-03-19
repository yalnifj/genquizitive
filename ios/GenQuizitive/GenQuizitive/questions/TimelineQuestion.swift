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
            self.questionText = "Place the facts for \(self.person!.display!.name!) in the correct order on the timeline."
            self.isReady = true
            onCompletion(self, nil)
        }
    }
}

class TimelineQuestionView : UIView, UICollectionViewDataSource, UICollectionViewDelegate {
    var view:UIView!
    
    @IBOutlet weak var avatarBadge: AvatarBadge!
    @IBOutlet weak var textShadow: UIView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var collectionView: UICollectionView!
    
    var sortedFacts:[Fact] = [Fact]()
    var facts:[Fact] = [Fact]()
    
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
        
        let cellNib = UINib(nibName: "TimelineFactView", bundle: nil)
        collectionView.register(cellNib, forCellWithReuseIdentifier: "TimelineFactView")
        collectionView.delegate = self
        collectionView.dataSource = self
        
        let gesture = UIPanGestureRecognizer(target: self, action: #selector(moveFact))
        collectionView.addGestureRecognizer(gesture)
        
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
            
            sortedFacts = LanguageService.getInstance().sortFacts(facts: question.person!.facts)
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
            
            collectionView.reloadData()
        }
    }
    
    func checkComplete() -> Bool {
        var complete = true
        for i in 0..<facts.count {
            if sortedFacts[i].id == facts[i].id {
                complete = false
                break
            }
        }
        return complete
    }
    
    @objc func moveFact(gesture:UIPanGestureRecognizer) {
        switch(gesture.state) {
        case UIGestureRecognizerState.began:
            guard let selectedIndexPath = self.collectionView.indexPathForItem(at: gesture.location(in: self.collectionView)) else {
                break
            }
            collectionView.beginInteractiveMovementForItem(at: selectedIndexPath)
        case UIGestureRecognizerState.changed:
            collectionView.updateInteractiveMovementTargetPosition(gesture.location(in: gesture.view!))
        case UIGestureRecognizerState.ended:
            collectionView.endInteractiveMovement()
        default:
            collectionView.cancelInteractiveMovement()
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return self.facts.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "TimelineFactView", for: indexPath) as! TimelineFactView
        let ratio = cell.frame.width / cell.frame.height
        cell.frame.size.width = collectionView.frame.width
        cell.frame.size.height = cell.frame.size.width / ratio
        let fact = facts[indexPath.item]
        cell.showFact(fact: fact, person: self.question.person!)
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView,
                                 moveItemAt sourceIndexPath: IndexPath,
                                 to destinationIndexPath: IndexPath) {
        let f1 = self.facts[destinationIndexPath.item]
        let f2 = self.facts[sourceIndexPath.item]
        self.facts[destinationIndexPath.item] = f2
        self.facts[sourceIndexPath.item] = f1
        
        let factView2 = collectionView.cellForItem(at: destinationIndexPath) as! TimelineFactView
        let factView1 = collectionView.cellForItem(at: sourceIndexPath) as! TimelineFactView
        
        let sf1 = sortedFacts[sourceIndexPath.item]
        let sf2 = sortedFacts[destinationIndexPath.item]
        
        if sf1.id == f1.id {
            factView1.showDates(showHide: true)
        } else {
            factView1.showDates(showHide: false)
        }
        
        if sf2.id == f2.id {
            factView2.showDates(showHide: true)
        } else {
            factView2.showDates(showHide: false)
        }
        
        if checkComplete() {
            print("correct")
            EventHandler.getInstance().publish("questionCorrect", data: question)
        }
    }
}
