//
//  TimelineFactScroller.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/30/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class TimelineFactScroller : UIScrollView {
    var poleImage: UIImageView?
    var selectedFact:TimelineFactView?
    var timelineFactViews = [TimelineFactView]()
    
    var lastLocation = CGPoint(x: 0, y: 0)
    var maxY = CGFloat(5)
    var padding = CGFloat(10)
    
    var sortedFacts:[Fact] = [Fact]()
    var facts:[Fact] = [Fact]()
    var question:TimelineQuestion?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        //let panRecognizer = UIPanGestureRecognizer(target:self, action:#selector(detectPan(_:)))
        //self.addGestureRecognizer(panRecognizer)
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        //let panRecognizer = UIPanGestureRecognizer(target:self, action:#selector(detectPan(_:)))
        //self.addGestureRecognizer(panRecognizer)
    }
    
    func showQuestion(question:TimelineQuestion) {
        self.question = question
        if question.facts != nil {
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
            let fh = self.frame.width * ratio
            for i in 0..<facts.count {
                let fact = facts[i]
                let frame = CGRect(x: 0, y: y, width: self.frame.width, height: fh)
                let tfv = TimelineFactView(frame: frame)
                tfv.showFact(fact: fact, person: question.person!)
                if sortedFacts[i].id == facts[i].id {
                    tfv.showDates(showHide: true)
                } else {
                    tfv.showDates(showHide: false)
                }
                timelineFactViews.append(tfv)
                self.addSubview(tfv)
                maxY = y + padding
                y = y + fh + padding
            }
            
            poleImage = UIImageView(image: UIImage(named: "pole1"))
            poleImage?.frame = CGRect(x: (fh / 2) - 6, y: fh / 2, width: 12, height: y - fh)
            self.insertSubview(poleImage!, at: 0)
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
    
    func slideFacts() {
        var y = CGFloat(5)
        var spaceAdded = false
        for i in 0..<timelineFactViews.count {
            let view = timelineFactViews[i]
            if view != selectedFact {
                if !spaceAdded && view.center.y >= selectedFact!.center.y {
                    y += selectedFact!.frame.height + padding
                    spaceAdded = true
                }
                if y != view.frame.origin.y {
                    animateView(view: view, y: y)
                }
                y += selectedFact!.frame.height + padding
            }
        }
    }
    
    func animateView(view:TimelineFactView, y:CGFloat) {
        UIView.animate(withDuration: 0.3, delay: 0, options: UIViewAnimationOptions.curveEaseIn,
            animations: { () -> Void in
            view.frame.origin.y = y
            self.layoutIfNeeded()
        },
        completion: { (finished) -> Void in
                        
        })
    }
    
    func snapFacts() {
        timelineFactViews.sort(by: {f1, f2 in
            return f1.frame.origin.y < f2.frame.origin.y
        })
        facts = [Fact]()
        var y = CGFloat(5)
        var i = 0
        for tfv in timelineFactViews {
            facts.append(tfv.fact!)
            tfv.frame.origin.y = y
            y += selectedFact!.frame.height + padding
            if facts[i].id == sortedFacts[i].id {
                tfv.showDates(showHide: true)
            } else {
                tfv.showDates(showHide: false)
            }
            i += 1
        }
        
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        if self.selectedFact != nil {
            let touch = touches.first!
            let point = touch.location(in: self)
            var y = self.selectedFact!.frame.origin.y - (lastLocation.y - point.y)
            lastLocation = point
            if y < 5 {
                y = 5
            }
            if y > maxY {
                y = maxY
            }
            self.selectedFact!.frame.origin = CGPoint(x: self.selectedFact!.frame.origin.x, y: y)
            slideFacts()
        }
    }
    
    override func touchesBegan(_ touches: (Set<UITouch>!), with event: UIEvent!) {
        super.touchesBegan(touches, with: event)
        self.selectedFact = nil
        let touch = touches.first!
        let point = touch.location(in: self)
        for subview in self.timelineFactViews {
            if subview.frame.contains(point) {
                selectedFact = subview
                break
            }
        }
        if self.selectedFact != nil {
            self.selectedFact!.superview?.bringSubview(toFront: self.selectedFact!)
            // Remember original location
            lastLocation = point
        }
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if selectedFact != nil {
            snapFacts()
            if checkComplete() {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                }
            }
        }
        selectedFact = nil
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if selectedFact != nil {
            snapFacts()
            if checkComplete() {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    EventHandler.getInstance().publish("questionCorrect", data: self.question!)
                }
            }
        }
        selectedFact = nil
    }
}
