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
			
			self.questionText = "Connect the tree path to \(self.person!.display!.name!)"
            familyTreeService.markUsed(personId: self.person!.id!)
            
            print(self.path!.description)
            self.isReady = true
			onCompletion(self, nil)
        })
    }
}

class ConnectionLevel {
	var parent1:AvatarBadge!
	var parent2:AvatarBadge!
	var lines:LineView!
	init(p1:AvatarBadge, p2:AvatarBadge, ls:TreeLineView) {
		parent1 = p1
		parent2 = p2
		lines = ls
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
        color.set()
        aPath.stroke()
    }
}

class ConnectQuestionView : UIView {
    var view:UIView!
	@IBOutlet weak var scroller: UIScrollView!
    
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
			let width = scroller.frame.width / 4
			let frame = CGRect(x: scroller.center.x, y: width * 3, width: width, height: width)
			self.startAvatar = AvatarBadge(frame: frame)
			self.startAvatar?.showAncestorBackground()
			let name = LanguageService.getInstance().shortenName(name: question.startPerson!.display!.name!)
			self.startAvatar?.setLabel(text: name)
			self.startAvatar?.person = question.startPerson
			getAvatarPortrait(self.startAvatar!)
			scroller.addSubview(self.startAvatar!)
			
		
			let familyTreeService = FamilyTreeService.getInstance()
			familyTreeService.getParents(personId: question.startPerson!.id!, onCompletion: {parents, err in
				if parents != nil && parents!.count > 0 {
					let frame1 = CGRect(x: scroller.center.x - width * CGFloat(1.2), y: width * CGFloat(1.5), width: width: height: width)
					let parent1 = AvatarBadge(frame: frame1)
					parent1.showAncestorBackground()
					let name1 = LanguageService.getInstance().shortenName(name: parents![0].display!.name!)
					parent1.setLabel(text: name1)
					parent1.person = parents[0]
					getAvatarPortrait(parent1)
					scroller.addSubview(parent1)
					
					let frame2 = CGRect(x: scroller.center.x + width*1.2, y: width * 1.5, width: width: height: width)
					let parent2 = AvatarBadge(frame: frame2)
					parent2.showAncestorBackground()
					if parents!.count > 1 {
						let name2 = LanguageService.getInstance().shortenName(name: parents[1].display!.name!)
						parent2.setLabel(text: name2)
						parent2.person = parents[1]
						getAvatarPortrait(parent2)
					}
					scroller.addSubview(parent2)
					
					let lineFrame = CGRect(x: parent1.center.x, y: parent1.center.y, width: width * CGFloat(2.4), height: width)
					let lines = TreeLineView(frame: lineFrame)
					scroller.addSubview(lines)
				
					let level = ConnectionLevel(p1: parent1, p2: parent2: lines: lines)
					self.levels.append(level)
				}
			})
		}
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
}
