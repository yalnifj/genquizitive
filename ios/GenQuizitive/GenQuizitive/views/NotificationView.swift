//
//  NotificationView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/20/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class NotificationView: UIView {
    
    var view:UIView!
    @IBOutlet weak var titleLbl: UILabel!
    @IBOutlet weak var messageLbl: UILabel!
    @IBOutlet weak var closeBtn: UIButton!
    
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
        
        let screenSize = UIScreen.main.bounds
        let xOffset = CGFloat((screenSize.width - self.frame.width) / 2.0)
        let yOffset = CGFloat(-self.frame.height)
        self.frame = CGRect(x: xOffset, y: yOffset, width: self.frame.width, height: self.frame.height)
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "NotificationView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

    func showMessage(title:String, message:String, showButton:Bool, duration:Double) {
        titleLbl.text = title
        messageLbl.text = message
        closeBtn.isHidden = !showButton
        
        let screenSize = UIScreen.main.bounds
        let xOffset = CGFloat((screenSize.width - self.frame.width) / 2.0)
        let yOffset = CGFloat(-self.frame.height)
        self.frame = CGRect(x: xOffset, y: yOffset, width: self.frame.width, height: self.frame.height)
        
        UIView.animate(withDuration: duration,
            delay: 0,
            options: UIViewAnimationOptions.curveEaseIn,
            animations: { () -> Void in
                self.frame = CGRect(x: xOffset, y: 20, width: self.frame.width, height: self.frame.height)
                self.superview?.layoutIfNeeded()
            },
            completion: { (finished) -> Void in
                // ....
            }
        )
    }
    
    func hideMessage() {
        UIView.animate(withDuration: 0.5,
               delay: 0,
               options: UIViewAnimationOptions.curveEaseIn,
               animations: { () -> Void in
                self.frame = CGRect(x: self.frame.origin.x, y: -self.frame.height, width: self.frame.width, height: self.frame.height)
                self.superview?.layoutIfNeeded()
            },
               completion: { (finished) -> Void in
                self.removeFromSuperview()
            }
        )

    }
    
    @IBAction func closeBtnClick(_ sender: Any) {
        self.hideMessage()
    }
    
}
