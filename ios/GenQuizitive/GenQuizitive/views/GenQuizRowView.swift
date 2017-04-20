//
//  GenQuizRowView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/19/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class GenQuizRowView : UIView {
    static var TOPIC_GENQUIZ_SELECTED = "genquiz_selected"
    
    var view:UIView!
    @IBOutlet weak var message: UILabel!
    @IBOutlet weak var avatar: AvatarBadge!
    @IBOutlet weak var backView: UIView!
    
    var genQuiz:GenQuizRound?
    var touchBegan = false
    
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
        
        backView.layer.cornerRadius = backView.frame.height * 0.5
        backView.clipsToBounds = true
        backView.layer.borderWidth = 2
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "GenQuizRow", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showGenQuizRound(genQuiz: GenQuizRound) {
        self.genQuiz = genQuiz
        let firebaseService = FirebaseService.getInstance()
        let myId = firebaseService.userDetails!.id
        if myId == genQuiz.toId {
            firebaseService.getUserDetailsById(userId: genQuiz.fromId!, onCompletion: {friend in
                let name = LanguageService.getInstance().shortenName(name: friend!.name)
                self.avatar.setLabel(text: name)
                if friend?.photoUrl != nil {
                    let url = URL(string: friend!.photoUrl!)
                    if url != nil {
                        let data = NSData(contentsOf: url!)
                        if data != nil {
                            let image = UIImage(data: data as! Data)
                            if image != nil {
                                self.avatar.setProfileImage(image: image!)
                            }
                        }
                    }
                }
            })
        }
        
        if genQuiz.myTotalTime > 0 && genQuiz.friendTotalTime > 0 {
            message.text = "See Who Won!"
        } else if genQuiz.myTotalTime == 0 {
            message.text = "It's Your Turn!"
        } else {
            message.text = "Waiting for friend..."
        }
    }

    override func touchesBegan(_ touches: (Set<UITouch>!), with event: UIEvent!) {
        super.touchesBegan(touches, with: event)
        touchBegan = true
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if touchBegan {
            EventHandler.getInstance().publish(GenQuizRowView.TOPIC_GENQUIZ_SELECTED, data: self)
        }
        touchBegan = false
    }

}
