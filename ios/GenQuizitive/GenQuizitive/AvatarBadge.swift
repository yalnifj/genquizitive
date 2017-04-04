//
//  AvatarBadge.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/7/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class AvatarBadge: UIView {
    
    @IBOutlet weak var background: UIImageView!
    var profileImage: UIImageView?
    @IBOutlet weak var label: UILabel!
    var view:UIView!
    
    var person:Person?
    
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
        
        label.layer.cornerRadius = 10
        label.clipsToBounds = true
        label.layer.borderColor = UIColor.black.cgColor
        label.layer.borderWidth = 1
        label.isHidden = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "AvatarBadge", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func showAncestorBackground() {
        background.image = UIImage(named: "ancestor_badge")
    }
    
    func showFriendBackground() {
        background.image = UIImage(named: "avatar_badge")
    }

    func setProfileImage(image: UIImage) {
        if profileImage != nil {
            profileImage?.removeFromSuperview()
        }
        let frame = CGRect(x: self.frame.width * 0.16, y: self.frame.height * 0.14, width: self.frame.width * 0.69, height: self.frame.height * 0.69)
        profileImage = UIImageView(frame: frame)
        profileImage?.image = image
        profileImage?.layer.cornerRadius = min(profileImage!.frame.size.width/2, profileImage!.frame.size.height/2)
        profileImage?.clipsToBounds = true
        self.addSubview(profileImage!)
    }
    
    func setLabel(text: String) {
        label.text = text
        label.isHidden = false
    }
}
