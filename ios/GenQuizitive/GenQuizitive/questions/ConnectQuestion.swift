//
//  ConnectQuestion.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/6/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class ConnectQuestion : Question {
    var path:[Relationship]?
    var relationshipText:String?
    var startPerson:Person?
    
    override init() {
        super.init()
        self.name  = "connect"
        self.letter = "C"
        self.background = "tree_background.jpg"
        self.hints = ["freeze","skip","rollback"]
        self.person = nil
    }
    
    override func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?) -> Void) {
        print("Setting up question \(self.name)")
        self.difficulty = difficulty
        let length = difficulty + 1
        let familyTreeService = FamilyTreeService.getInstance()
        let relationshipService = RelationshipService.getInstance()
        self.isReady = false
        self.questionText = ""
        
        relationshipService.getRandomRelationshipPath(person: familyTreeService.fsUser!, length: length, useLiving: useLiving, relationshipType: "parents", onCompletion: {results in
            self.path = results["path"] as? [Relationship]
            self.person = results["lastPerson"] as? Person
            familyTreeService.markUsed(personId: self.person!.id!)
            
            if self.path == nil || self.person == nil || self.person?.id == familyTreeService.fsUser?.id {
                let error = NSError(domain: "ConnectQuestion", code: 404, userInfo: ["message":"Unable to find a random relationship path"])
                onCompletion(self, error)
                return
            }
            
            print(self.path!.description)
            self.relationshipText = relationshipService.verbalizePath(startPerson: familyTreeService.fsUser!, path: self.path!)
            print(self.relationshipText!.description)
            self.questionText = "Who is your \(self.relationshipText!)"
            familyTreeService.markUsed(personId: self.person!.id!)
        })
    }
}

class ConnectQuestionView : UIView {
    var view:UIView!
    
    var question:ConnectQuestion?
    
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
        let nib = UINib(nibName: "ConnectQuestionView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showQuestion(question:ConnectQuestion) {
        self.question = question

    }
}
