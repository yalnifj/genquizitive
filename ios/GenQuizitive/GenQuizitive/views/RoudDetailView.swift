//
//  RoudDetailView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/22/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class RoundDetailView: UIView {
    
    var view:UIView!
    @IBOutlet weak var guageHand: UIImageView!
    @IBOutlet weak var timerLbl: UILabel!
    @IBOutlet weak var letterLbl: UILabel!
    @IBOutlet weak var light1: UIImageView!
    @IBOutlet weak var light2: UIImageView!
    @IBOutlet weak var light3: UIImageView!
    @IBOutlet weak var light4: UIImageView!
    @IBOutlet weak var light5: UIImageView!
    
    var penaltyCount:Int = 0
    var timer:Timer?
    var timeElapsed:TimeInterval = 0
    
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
        let nib = UINib(nibName: "RoundDetailView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func addPenalty() {
        penaltyCount += 1
        if penaltyCount > 0 {
            light1.isHidden = false
            light1.image = UIImage(named: "red_light_on.png")
        }
        if penaltyCount > 1 {
            light2.isHidden = false
            light2.image = UIImage(named: "red_light_on.png")
        }
        if penaltyCount > 2 {
            light3.isHidden = false
            light3.image = UIImage(named: "red_light_on.png")
            light4.isHidden = false
            light5.isHidden = false
        }
        if penaltyCount > 3 {
            light4.isHidden = false
            light4.image = UIImage(named: "red_light_on.png")
        }
        if penaltyCount > 4 {
            light5.isHidden = false
            light5.image = UIImage(named: "red_light_on.png")
        }
    }
    
    func setLetter(letter:String) {
        letterLbl.text = letter
    }

    func updateTimer() {
        timeElapsed += 1.0
        let minutes = Int(timeElapsed / 60)
        let seconds = Int(timeElapsed - Double(minutes * 60))
        var secText = "\(seconds)"
        if seconds < 10 {
            secText = "0\(seconds)"
        }
        var minText = "\(minutes)"
        if minutes < 10 {
            minText = "0\(minutes)"
        }
        timerLbl.text = "\(minText):\(secText)"
    }
    
    func pauseTimer() {
        if timer != nil {
            timer!.invalidate()
        }
    }
    
    func startTimer() {
        if timer == nil || !timer!.isValid {
            let aSelector : Selector = #selector(RoundDetailView.updateTimer)
            timer = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: aSelector, userInfo: nil, repeats: true)
        }
    }
    
    func resetTimer() {
        timeElapsed = 0
    }
    
    func setGuageProgress(progress:Double) {
        let maxAngle = 290.0
        let angle = maxAngle * progress
        UIView.animate(withDuration: 0.7, animations: { () -> Void in
            self.guageHand.transform = CGAffineTransform(rotationAngle: CGFloat(angle * M_PI / 180))
        }) { (succeed) -> Void in
            
        }
    }
}
