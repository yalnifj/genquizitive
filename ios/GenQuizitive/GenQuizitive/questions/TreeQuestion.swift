//
//  TreeQuestion.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/31/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class TreeQuestion : Question {
    var setupCount = 0
    var people = [Person]()
    
    override init() {
        super.init()
        self.name  = "tree"
        self.letter = "T"
        self.background = "tree_background.jpg"
        self.hints = ["freeze","skip","rollback"]
        self.person = nil
    }

    override func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?) -> Void) {
        print("Setting up question \(self.name)")
        self.setupCount += 1
        self.difficulty = difficulty
        self.isReady = false
        let familyTreeService = FamilyTreeService.getInstance()
        self.person = familyTreeService.getRandomPerson(useLiving: useLiving, difficulty: self.difficulty)
        familyTreeService.getAncestorTree(personId: self.person!.id!, generations: 2, details: false, spouse: nil, noCache: true, onCompletion: {people, err in
            if people != nil && people!.count > difficulty + 1 {
                self.setupCount = 0
                for person in people! {
                    if !person.display!.ascendancyNumber!.contains("S") {
                        self.people.append(person)
                    }
                }
                self.isReady = true
                onCompletion(self, nil)
            } else {
                if self.setupCount < 8 {
                    self.setup(difficulty: difficulty, useLiving: useLiving, onCompletion: onCompletion)
                } else {
                    onCompletion(self, NSError(domain: "TreeQuestion", code: 404, userInfo: ["message":"Unable to find a person with enough ancestors"]))
                }
            }
        })
    }
    
    override func getPersistMap() -> [String : Any?] {
        var map = super.getPersistMap()
        var peopleMap = [[String:Any?]]()
        for person in people {
            var personMap = [String:Any?]()
            personMap["id"] = person.id
            var displayMap = [String:Any?]()
            displayMap["name"] = person.display?.name
            displayMap["ascendancyNumber"] = person.display?.ascendancyNumber
            personMap["display"] = displayMap
            personMap["portrait"] = FamilyTreeService.getInstance().portraits[person.id]
            peopleMap.append(personMap)
        }
        map["people"] = peopleMap
        return map
    }
    
    override func setupFromPersistenceMap(map: [String : Any?]) {
        super.setupFromPersistenceMap(map: map)
        people = [Person]()
        let answerMap = map["people"] as! [[String:Any?]]
        for personMap in answerMap {
            let person = Person()
            person.id = personMap["id"] as? String
            let displayMap = personMap["display"] as? [String:Any?]
            if displayMap != nil {
                person.display = DisplayProperties()
                person.display?.name = displayMap!["name"] as? String
                person.display?.ascendancyNumber = displayMap!["ascendancyNumber"] as? String
            }
            people.append(person)
        }
    }

}

class TreeQuestionView : UIView {
    var view:UIView!
    
    @IBOutlet weak var bigSign: UIImageView!
    @IBOutlet weak var sign1: UIImageView!
    @IBOutlet weak var sign2: UIImageView!
    @IBOutlet weak var sign3: UIImageView!
    @IBOutlet weak var sign4: UIImageView!
    @IBOutlet weak var sign5: UIImageView!
    @IBOutlet weak var sign6: UIImageView!
    @IBOutlet weak var sign7: UIImageView!
    
    var question:TreeQuestion?
    var avatars = [AvatarBadge]()
    var people = [Person]()
    var selected:AvatarBadge?
    var lastLocation = CGPoint(x: 0, y: 0)
    var originalLocation = CGPoint(x: 0, y: 0)
    var signs = [UIImageView]()
    var correctAvatars = [AvatarBadge]()
    
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
        let nib = UINib(nibName: "TreeQuestionView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showQuestion(question:TreeQuestion) {
        self.question = question
        if avatars.count > 0 {
            for avatar in avatars {
                avatar.removeFromSuperview()
            }
            avatars.removeAll()
            people.removeAll()
        }
        
        if correctAvatars.count > 0 {
            for avatar in correctAvatars {
                avatar.removeFromSuperview()
            }
            correctAvatars.removeAll()
        }
        
        signs.removeAll()
        signs.append(sign1)
        signs.append(sign2)
        signs.append(sign3)
        signs.append(sign4)
        signs.append(sign5)
        signs.append(sign6)
        signs.append(sign7)
        
        var x = bigSign.frame.origin.x + 15
        var y = bigSign.frame.origin.y + 35
        let width = sign1.frame.height
        
        for person in question.people {
            self.addPerson(person: person, x: x, y: y)
            
            x = x + width + 5
            if x + width > bigSign.frame.origin.x + bigSign.frame.width {
                x = bigSign.frame.origin.x + 15
                y = y + width + 5
            }
        }
        
        for a in 0..<avatars.count {
            let r = Int(arc4random_uniform(UInt32(avatars.count)))
            let newOrigin = CGPoint(x: avatars[r].frame.origin.x, y: avatars[r].frame.origin.y)
            let oldOrigin = avatars[a].frame.origin
            avatars[a].frame.origin = newOrigin
            avatars[r].frame.origin = oldOrigin
        }
        
        //-- place random people according to difficulty
        let upper = ((people.count - 4) - question.difficulty)
        if upper >= 0 {
            for _ in 0..<upper {
                let avatar = avatars.removeLast()
                correctAvatars.append(avatar)
                for p in 0..<people.count {
                    if avatar.person!.id == people[p].id {
                        if p == 0 {
                            avatar.center = sign1.center
                            sign1.layer.borderWidth = 3
                            sign1.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 1 {
                            avatar.center = sign2.center
                            sign2.layer.borderWidth = 3
                            sign2.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 2 {
                            avatar.center = sign3.center
                            sign3.layer.borderWidth = 3
                            sign3.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 3 {
                            avatar.center = sign4.center
                            sign4.layer.borderWidth = 3
                            sign4.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 4 {
                            avatar.center = sign5.center
                            sign5.layer.borderWidth = 3
                            sign5.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 5 {
                            avatar.center = sign6.center
                            sign6.layer.borderWidth = 3
                            sign6.layer.borderColor = UIColor.yellow.cgColor
                        }
                        if p == 6 {
                            avatar.center = sign7.center
                            sign7.layer.borderWidth = 3
                            sign7.layer.borderColor = UIColor.yellow.cgColor
                        }
                        break
                    }
                }
            }
        }
    }
    
    func addPerson(person:Person, x:CGFloat, y:CGFloat) {
        self.people.append(person)
        let width = self.sign1.frame.height
        let frame = CGRect(x: x, y: y, width: width, height: width)
        let avatar = AvatarBadge(frame: frame)
        avatar.showPerson(person: person)
        self.addSubview(avatar)
        self.avatars.append(avatar)
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        if self.selected != nil {
            let touch = touches.first!
            let point = touch.location(in: self)
            var y = self.selected!.frame.origin.y - (lastLocation.y - point.y)
            var x = self.selected!.frame.origin.x - (lastLocation.x - point.x)
            lastLocation = point
            if y < 0 {
                y = 0
            }
            if y > self.frame.height - selected!.frame.height {
                y = self.frame.height - selected!.frame.height
            }
            if x < 0 {
                x = 0
            }
            if x > self.frame.width - selected!.frame.width {
                x = self.frame.width - selected!.frame.width
            }
            self.selected!.frame.origin = CGPoint(x: x, y: y)
        }
    }
    
    override func touchesBegan(_ touches: (Set<UITouch>!), with event: UIEvent!) {
        super.touchesBegan(touches, with: event)
        self.selected = nil
        let touch = touches.first!
        let point = touch.location(in: self)
        for subview in self.avatars {
            if subview.frame.contains(point) {
                selected = subview
                break
            }
        }
        if self.selected != nil {
            self.selected!.superview?.bringSubview(toFront: self.selected!)
            // Remember original location
            lastLocation = point
            originalLocation = self.selected!.frame.origin
        }
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if selected != nil {
            checkPlace()
            if checkComplete() {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                }
            }
        }
        selected = nil
    }
    
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if selected != nil {
            checkPlace()
            if checkComplete() {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                }
            }
        }
        selected = nil
    }
    
    func checkPlace() {
        var found = false
        var i = 0
        for sign in signs {
            if sign.layer.borderWidth == 0 && sign.frame.contains(selected!.center) {
                selected?.center = sign.center
                for j in 0..<people.count {
                    let p = people[j]
                    if p.id == selected!.person!.id {
                        if p.display?.ascendancyNumber! == String(i + 1) {
                            //-- highlight correct spot
                            sign.layer.borderColor = UIColor.yellow.cgColor
                            sign.layer.borderWidth = 3
                            //-- disable dragging
                            correctAvatars.append(selected!)
                            let index = avatars.index(of: selected!)
                            avatars.remove(at: index!)
                        } else {
                            //-- highlight incorrect spot
                            sign.layer.borderColor = UIColor.red.cgColor
                            sign.layer.borderWidth = 3
                        }
                    }
                }
                found = true
                break
            }
            i += 1
        }
        if !found {
            let view = self.selected!
            UIView.animate(withDuration: 0.3, delay: 0, options: UIViewAnimationOptions.curveEaseIn,
               animations: { () -> Void in
                view.frame.origin = self.originalLocation
                self.layoutIfNeeded()
            },
               completion: { (finished) -> Void in
                            
            })
        } else {
            for sign in signs {
                if sign.frame.contains(originalLocation) {
                    sign.layer.borderWidth = 0
                    break
                }
            }
        }
    }

    func checkComplete() -> Bool {
        if correctAvatars.count == people.count {
            return true
        }
        return false
    }
}
