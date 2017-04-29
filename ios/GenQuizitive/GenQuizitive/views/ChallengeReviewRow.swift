//
//  ChallengeReviewRow.swift
//  GenQuizitive
//
//  Created by John Finlay on 4/29/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class ChallengeReviewRow: UIView {
    
    var view:UIView!
    
    @IBOutlet weak var letterLbl: UILabel!
    @IBOutlet weak var avatar: AvatarBadge!
    @IBOutlet weak var timeLbl: UILabel!
    @IBOutlet weak var friendTimeLbl: UILabel!
    
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
        let nib = UINib(nibName: "ChallengeReviewRow", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showQuestion(question:Question) {
        letterLbl.text = question.letter
        if question.person != nil {
            avatar.showPerson(person: question.person!)
        } else {
            avatar.showAncestorBackground()
        }
        
        if question.myTime != nil {
            let minutes = Int(question.myTime! / 60)
            let seconds = Int(question.myTime! - Double(minutes * 60))
            var secText = "\(seconds)"
            if seconds < 10 {
                secText = "0\(seconds)"
            }
            var minText = "\(minutes)"
            if minutes < 10 {
                minText = "0\(minutes)"
            }
            timeLbl.text = "\(minText):\(secText)"
        }
        
        if question.friendTime != nil {
            let minutes = Int(question.friendTime! / 60)
            let seconds = Int(question.friendTime! - Double(minutes * 60))
            var secText = "\(seconds)"
            if seconds < 10 {
                secText = "0\(seconds)"
            }
            var minText = "\(minutes)"
            if minutes < 10 {
                minText = "0\(minutes)"
            }
            friendTimeLbl.text = "\(minText):\(secText)"
        }

    }
    
}
