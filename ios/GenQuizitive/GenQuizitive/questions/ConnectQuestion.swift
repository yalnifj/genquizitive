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
		self.startPerson = familyTreeService.fsUser
        
        relationshipService.getRandomRelationshipPath(person: familyTreeService.fsUser!, length: length, useLiving: useLiving, relationshipType: "parents", onCompletion: {results in
            let path = results["path"] as? [Relationship]
            self.person = results["lastPerson"] as? Person
            
            if path == nil || self.person == nil || self.person?.id == familyTreeService.fsUser?.id {
                let error = NSError(domain: "ConnectQuestion", code: 404, userInfo: ["message":"Unable to find a random relationship path"])
                onCompletion(self, error)
                return
            }
			
			self.questionText = "Follow the tree path up to \(self.person!.display!.name!)"
            familyTreeService.markUsed(personId: self.person!.id!)

            self.isReady = true
			onCompletion(self, nil)
        })
    }
    
    override func getPersistMap() -> [String : Any?] {
        var map = super.getPersistMap()
        if startPerson != nil {
            var personMap = [String:Any?]()
            personMap["id"] = startPerson!.id
            var displayMap = [String:Any?]()
            displayMap["name"] = startPerson?.display?.name
            displayMap["ascendancyNumber"] = startPerson?.display?.ascendancyNumber
            personMap["display"] = displayMap
            personMap["portrait"] = FamilyTreeService.getInstance().portraits[startPerson!.id]
            map["startPerson"] = personMap
        }

        return map
    }
    
    override func setupFromPersistenceMap(map: [String : Any?]) {
        super.setupFromPersistenceMap(map: map)
        let personMap = map["startPerson"] as? [String:Any?]
        if personMap != nil {
            startPerson = Person()
            startPerson?.id = personMap!["id"] as? String
            let displayMap = personMap!["display"] as? [String:Any?]
            if displayMap != nil {
                startPerson?.display = DisplayProperties()
                startPerson?.display?.name = displayMap!["name"] as? String
                startPerson?.display?.ascendancyNumber = displayMap!["ascendancyNumber"] as? String
            }
            let familyTreeService = FamilyTreeService.getInstance()
            if familyTreeService.remoteService != nil && familyTreeService.remoteService?.sessionId != nil {
                familyTreeService.getPerson(personId: startPerson!.id, onCompletion: {person, err in
                    if person != nil {
                        self.startPerson = person
                    } else {
                        if personMap!["portrait"] != nil {
                            familyTreeService.portraits[self.startPerson!.id] = personMap!["portrait"] as? String
                        }
                    }
                })
            }

        }
    }
}

class ConnectionLevel {
	var parent1:AvatarBadge!
	var parent2:AvatarBadge!
	var lines:TreeLineView!
    var index:Int!
    init(p1:AvatarBadge, p2:AvatarBadge, ls:TreeLineView, index:Int) {
		parent1 = p1
		parent2 = p2
		lines = ls
        self.index = index
	}
    func targetParent1() {
        let center = (parent1.superview!.frame.width / 2) - (parent1.frame.width / 2)
        parent1.frame.origin.x = center
        parent2.frame.origin.x = center + (2 * (parent2.frame.width / 1.5))
        lines.frame.origin.x = parent1.center.x
        lines.style = "right"
        lines.setNeedsDisplay()
    }
    func targetParent2() {
        let center = (parent1.superview!.frame.width / 2) - (parent1.frame.width / 2)
        parent1.frame.origin.x = center - (2 * (parent2.frame.width / 1.5))
        parent2.frame.origin.x = center
        lines.frame.origin.x = parent1.center.x
        lines.style = "left"
        lines.setNeedsDisplay()
    }
    func targetParent(avatar:AvatarBadge) {
        if avatar == parent1 {
            targetParent1()
        } else if avatar == parent2 {
            targetParent2()
        }
    }
    func adjustY(y:CGFloat) {
        parent1.frame.origin.y += y
        parent2.frame.origin.y += y
        lines.frame.origin.y += y
    }
}

class TreeLineView : UIView {
	var color:UIColor?
	var lineWidth = CGFloat(3)
	var style = "center"
	
	override init(frame: CGRect) {
        super.init(frame: frame)
        
        self.backgroundColor = UIColor.clear
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
	
	override func draw(_ rect: CGRect) {
        let aPath = UIBezierPath()
		aPath.lineWidth = self.lineWidth
		if style == "center" {
			aPath.move(to: CGPoint(x:0, y:0))
			aPath.addLine(to: CGPoint(x:self.frame.width / 2, y:self.frame.height))
            aPath.move(to: CGPoint(x:self.frame.width / 2, y:self.frame.height))
			aPath.addLine(to: CGPoint(x:self.frame.width, y:0))
		} else if style == "left" {
			aPath.move(to: CGPoint(x:0, y:0))
			aPath.addLine(to: CGPoint(x:self.frame.width, y:self.frame.height))
            aPath.move(to: CGPoint(x:self.frame.width, y:self.frame.height))
			aPath.addLine(to: CGPoint(x:self.frame.width, y:0))
		} else if style == "right" {
			aPath.move(to: CGPoint(x:0, y:0))
			aPath.addLine(to: CGPoint(x:0, y:self.frame.height))
            aPath.move(to: CGPoint(x:0, y:self.frame.height))
			aPath.addLine(to: CGPoint(x:self.frame.width, y:0))
		}
        aPath.close()

		if color == nil {
			color = UIColor(red: 0.082, green: 0.451, blue: 0.463, alpha: 1.0)
		}
        color!.set()
        aPath.stroke()
    }
}

class ConnectQuestionView : UIView, EventListener {
    var view:UIView!
	@IBOutlet weak var scroller: UIScrollView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var textShadow: UILabel!
    
	var startAvatar:AvatarBadge?
	var levels = [ConnectionLevel]()
	
    var question:ConnectQuestion?
    
    var avatarWidth = CGFloat(50)
    
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
        
        EventHandler.getInstance().subscribe(AvatarBadge.TOPIC_PERSON_TAPPED, listener: self)
        
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

		if question.startPerson != nil && question.person != nil {
            questionText.text = question.questionText
            
			avatarWidth = scroller.frame.width / 5
			let frame = CGRect(x: (scroller.frame.width / 2) - (avatarWidth / 2), y: 5 + avatarWidth * 2, width: avatarWidth, height: avatarWidth)
			self.startAvatar = AvatarBadge(frame: frame)
            self.startAvatar!.showPerson(person: question.startPerson!)
            scroller.addSubview(self.startAvatar!)
			
            let y = avatarWidth
            self.addLevel(person: question.startPerson!, y: y)
		}
        
        self.startAvatar?.superview?.bringSubview(toFront: self.startAvatar!)
        self.layoutIfNeeded()
    }
    
    func addLevel(person:Person, y: CGFloat) {
        let familyTreeService = FamilyTreeService.getInstance()
        familyTreeService.getParents(personId: person.id!, onCompletion: {parents, err in
            if parents != nil && parents!.count > 0 {
                DispatchQueue.main.async {
                    let frame1 = CGRect(x: self.startAvatar!.frame.origin.x - (self.avatarWidth / 1.5), y: y, width: self.avatarWidth, height: self.avatarWidth)
                    let parent1 = AvatarBadge(frame: frame1)
                    parent1.showPerson(person: parents![0])
                                    
                    let frame2 = CGRect(x: self.startAvatar!.frame.origin.x + (self.avatarWidth / 1.5), y: y, width: self.avatarWidth, height: self.avatarWidth)
                    let parent2 = AvatarBadge(frame: frame2)
                    parent2.showAncestorBackground()
                    if parents!.count > 1 {
                        parent2.showPerson(person: parents![1])
                    }
                    
                    let lineFrame = CGRect(x: parent1.center.x, y: parent1.center.y, width: parent2.center.x - parent1.center.x, height: self.avatarWidth)
                    let lines = TreeLineView(frame: lineFrame)
                    lines.contentMode = .redraw
                    
                    self.scroller.addSubview(lines)
                    self.scroller.addSubview(parent1)
                    self.scroller.addSubview(parent2)
                    
                    let level = ConnectionLevel(p1: parent1, p2: parent2, ls: lines, index: self.levels.count)
                    self.levels.append(level)
                    
                    self.positionLevels()
                }
            } else {
                print("Error getting parents")
            }
        })
    }
    
    func getLevelForAvatar(avatar: AvatarBadge) -> ConnectionLevel? {
        for level in self.levels {
            if level.parent1 == avatar || level.parent2 == avatar {
                return level
            }
        }
        return nil
    }
    
    func positionLevels() {
        var y = avatarWidth
        
        for level in self.levels.reversed() {
            level.parent1.frame.origin.y = y
            level.parent1.superview?.bringSubview(toFront: level.parent1)
            level.parent2.frame.origin.y = y
            level.parent2.superview?.bringSubview(toFront: level.parent2)
            level.lines.frame.origin.y = level.parent1.center.y
             y = y + self.avatarWidth + 5
        }
        self.startAvatar?.frame.origin.y = y
        self.startAvatar?.superview?.bringSubview(toFront: self.startAvatar!)
        self.scroller.layoutSubviews()
    }
    
    func onEvent(_ topic:String, data:Any?) {
        if topic == AvatarBadge.TOPIC_PERSON_TAPPED {
            DispatchQueue.main.async {
                let avatar = data as! AvatarBadge
                if avatar != self.startAvatar && avatar.person != nil {
                    if avatar.person!.id == self.question!.person!.id {
                        EventHandler.getInstance().unSubscribe(AvatarBadge.TOPIC_PERSON_TAPPED, listener: self)
                        EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                    } else {
                        let level = self.getLevelForAvatar(avatar: avatar)
                        if level != nil {
                            while self.levels.last!.index > level!.index {
                                let last = self.levels.removeLast()
                                last.parent1.removeFromSuperview()
                                last.parent2.removeFromSuperview()
                                last.lines.removeFromSuperview()
                            }
                        }
                        level?.targetParent(avatar: avatar)
                        
                        let y = self.avatarWidth
                        self.addLevel(person: avatar.person!, y: y)
                    }
                }
            }
        }
    }
    var listenerIndex:Int?
    func setListenerIndex(_ index:Int) {
        listenerIndex = index
    }
}
