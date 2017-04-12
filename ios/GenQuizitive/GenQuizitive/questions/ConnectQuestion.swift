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
    var relationshipText:String?
    var startPerson:Person?
    var person:Person?
    
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
        parent1.frame.origin.x = parent1.frame.origin.x + parent1.frame.width * 0.7
        parent2.frame.origin.x = parent2.frame.origin.x + parent2.frame.width * 0.7
        lines.style = "right"
    }
    func targetParent2() {
        parent1.frame.origin.x = parent1.frame.origin.x - parent1.frame.width * 0.7
        parent2.frame.origin.x = parent2.frame.origin.x - parent2.frame.width * 0.7
        lines.style = "left"
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
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
	
	override func draw(_ rect: CGRect) {
        let aPath = UIBezierPath()
		aPath.lineWidth = self.lineWidth
		if style == "center" {
			aPath.move(to: CGPoint(x:0, y:0))
			aPath.addLine(to: CGPoint(x:self.center.x, y:self.frame.height))
			aPath.addLine(to: CGPoint(x:self.frame.width, y:0))
		} else if style == "left" {
			aPath.move(to: CGPoint(x:self.center.x, y:0))
			aPath.addLine(to: CGPoint(x:self.center.x, y:self.frame.height))
			aPath.addLine(to: CGPoint(x:0, y:0))
		} else if style == "right" {
			aPath.move(to: CGPoint(x:self.center.x, y:0))
			aPath.addLine(to: CGPoint(x:self.center.x, y:self.frame.height))
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
    
	var startAvatar:AvatarBadge?
	var levels = [ConnectionLevel]()
	
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
            
			let width = scroller.frame.width / 4
			let frame = CGRect(x: scroller.center.x - width / 2, y: width * 3, width: width, height: width)
			self.startAvatar = AvatarBadge(frame: frame)
			self.startAvatar?.showAncestorBackground()
			let name = LanguageService.getInstance().shortenName(name: question.startPerson!.display!.name!)
			self.startAvatar?.setLabel(text: name)
			self.startAvatar?.person = question.startPerson
			getAvatarPortrait(avatar: self.startAvatar!)
			scroller.addSubview(self.startAvatar!)
			
            let y = width * CGFloat(1.5)
            self.addLevel(person: question.startPerson!, y: y)
		}
    }
    
    func addLevel(person:Person, y: CGFloat) {
        let width = scroller.frame.width / 4
        let familyTreeService = FamilyTreeService.getInstance()
        familyTreeService.getParents(personId: person.id!, onCompletion: {parents, err in
            if parents != nil && parents!.count > 0 {
                let frame1 = CGRect(x: self.scroller.center.x - width * CGFloat(1.2), y: y, width: width, height: width)
                let parent1 = AvatarBadge(frame: frame1)
                parent1.showAncestorBackground()
                let name1 = LanguageService.getInstance().shortenName(name: parents![0].display!.name!)
                parent1.setLabel(text: name1)
                parent1.person = parents![0]
                self.getAvatarPortrait(avatar: parent1)
                
                let frame2 = CGRect(x: self.scroller.center.x + width * CGFloat(1.2), y: y, width: width, height: width)
                let parent2 = AvatarBadge(frame: frame2)
                parent2.showAncestorBackground()
                if parents!.count > 1 {
                    let name2 = LanguageService.getInstance().shortenName(name: parents![1].display!.name!)
                    parent2.setLabel(text: name2)
                    parent2.person = parents![1]
                    self.getAvatarPortrait(avatar: parent2)
                }
                
                let lineFrame = CGRect(x: parent1.center.x, y: parent1.center.y, width: width * CGFloat(2.4), height: width)
                let lines = TreeLineView(frame: lineFrame)
                
                self.scroller.addSubview(lines)
                self.scroller.addSubview(parent1)
                self.scroller.addSubview(parent2)
                
                let level = ConnectionLevel(p1: parent1, p2: parent2, ls: lines, index: self.levels.count)
                self.levels.append(level)
            }
        })
    }
	
	func getAvatarPortrait(avatar:AvatarBadge) {
		if avatar.person != nil {
			FamilyTreeService.getInstance().getPersonPortrait(personId: avatar.person!.id, onCompletion: {path in
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
        let width = scroller.frame.width / 4
        let y = width * CGFloat(1.5)
        
        for level in self.levels.reversed() {
            level.parent1.frame.origin.y = y
            level.parent2.frame.origin.y = y
            level.lines.frame.origin.y = level.parent1.center.y
        }
    }
    
    func onEvent(_ topic:String, data:Any?) {
        if topic == AvatarBadge.TOPIC_PERSON_TAPPED {
            let avatar = data as! AvatarBadge
            if avatar.person != nil {
                if avatar.person!.id == self.question!.person!.id {
                    EventHandler.getInstance().unSubscribe(AvatarBadge.TOPIC_PERSON_TAPPED, listener: self)
                    EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                } else {
                    let level = getLevelForAvatar(avatar: avatar)
                    if level != nil {
                        while self.levels.last!.index > level!.index {
                            let last = self.levels.removeLast()
                            last.parent1.removeFromSuperview()
                            last.parent2.removeFromSuperview()
                            last.lines.removeFromSuperview()
                        }
                    }
                    level?.targetParent(avatar: avatar)
                    
                    let width = scroller.frame.width / 4
                    let y = width * CGFloat(1.5)
                    self.addLevel(person: avatar.person!, y: y)
                    
                    positionLevels()
                }
            }
        }
    }
    var listenerIndex:Int?
    func setListenerIndex(_ index:Int) {
        listenerIndex = index
    }
}
