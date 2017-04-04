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
    var person:Person?
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
    var correctSigns = [UIImageView]()
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

        correctSigns.removeAll()
        
        var x = bigSign.frame.origin.x + 5
        var y = bigSign.frame.origin.y + 30
        let width = sign1.frame.height
        
        for person in question.people {
            self.addPerson(person: person, x: x, y: y)
            
            x = x + width + 5
            if x + width > bigSign.frame.origin.x + bigSign.frame.width {
                x = bigSign.frame.origin.x + 5
                y = y + width + 5
            }
        }
        
        for a in 0..<avatars.count {
            let r = arc4random_uniform(UInt32(avatars.count))
            let newOrigin = CGPoint(avatars[r].frame.origin)
            let oldOrigin = avatars[a].frame.origin
            avatars[a].frame.origin = newOrigin
            avatars[r].frame.origin = oldOrigin
        }
        
        //-- place random people according to difficulty
        for i in 0..<((people.count - 4) - question.difficulty) {
            
        }
    }
    
    func addPerson(person:Person, x:CGFloat, y:CGFloat) {
        self.people.append(person)
        let width = self.sign1.frame.height
        let frame = CGRect(x: x, y: y, width: width, height: width)
        let avatar = AvatarBadge(frame: frame)
        avatar.showAncestorBackground()
        avatar.setLabel(text: person.display!.name!)
        avatar.person = person
        self.addSubview(avatar)
        
        FamilyTreeService.getInstance().getPersonPortrait(personId: person.id, onCompletion: {path in
            if path != nil {
                let fileManager = FileManager.default
                let url = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let photoUrl = url.appendingPathComponent(path!)
                let data = try? Data(contentsOf: photoUrl)
                if data != nil {
                    let uiImage = UIImage(data: data!)
                    if uiImage != nil {
                        avatar.setProfileImage(image: uiImage!)
                    }
                }
            }
        })
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
            self.selected!.frame.origin = CGPoint(x: self.selected!.frame.origin.x, y: y)
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
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
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
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
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
            if sign.layer.borderWidth == 0 && sign.frame.contains(selected!.center) && !correctSigns.contains(sign) {
                selected.center = sign.center
                for j in 0..<people.count {
                    if people[j] == selected!.person {
                        if j == i {
                            //-- highlight correct spot
                            correctSigns.append(sign)
                            sign.layer.borderColor = UIColor.yellow
                            sign.layer.borderWidth = 3
                            //-- disable dragging
                            correctAvatars.append(selected)
                            let index = avatars.index(of: selected)
                            avatars.remove(at: index)
                        } else {
                            //-- highlight incorrect spot
                            sign.layer.borderColor = UIColor.red
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
            UIView.animate(withDuration: 0.5, delay: 0, options: UIViewAnimationOptions.curveEaseIn,
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
