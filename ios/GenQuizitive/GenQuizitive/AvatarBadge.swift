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
    
    var background: UIImageView!
    var profileImage: UIImageView?
    var label: UILabel?
    
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
        self.backgroundColor = UIColor.clear
        
        let frame = CGRect(x: 0, y: 0, width: self.frame.width, height: self.frame.width)
        background = UIImageView(frame: frame)
        background.image = UIImage(named: "avatar_badge")
        background.backgroundColor = UIColor.clear
        background.contentMode = .scaleAspectFit
        self.addSubview(background)
        
        self.layoutIfNeeded()
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
        let frame = CGRect(x: 0, y: 0, width: self.frame.width * 0.68, height: self.frame.width * 0.68)
        profileImage = UIImageView(frame: frame)
        profileImage?.center = background.center
        profileImage?.image = image
        profileImage?.layer.cornerRadius = min(profileImage!.frame.size.width/2, profileImage!.frame.size.height/2)
        profileImage?.clipsToBounds = true
        profileImage?.contentMode = .scaleAspectFit
        self.addSubview(profileImage!)
        
        if label != nil {
            self.bringSubview(toFront: label)
        }
        self.layoutIfNeeded()
    }
    
    func setLabel(text: String) {
        let frame = CGRect(x: 0, y: self.frame.height - 20, width: self.frame.width, height: 20)
        label = UILabel(frame: frame)
        label?.layer.cornerRadius = 5
        label?.clipsToBounds = true
        //label?.layer.borderColor = UIColor.black.cgColor
        //label?.layer.borderWidth = 1
        label?.text = text
        label?.textAlignment = .center
        label?.numberOfLines = 2
        label?.adjustsFontSizeToFitWidth = true
        label?.backgroundColor = UIColor(red: 0.925, green: 0.909, blue: 0.745, alpha: 1.0)
        self.addSubview(label!)
        self.layoutIfNeeded()
    }
}
