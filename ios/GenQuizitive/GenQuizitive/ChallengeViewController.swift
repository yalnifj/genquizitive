//
//  ChallengeViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/15/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit
import FirebaseInvites
import GoogleSignIn

class ChallengeViewController: UIViewController, FIRInviteDelegate {
    @IBOutlet weak var noFriendsLbl: UILabel!
    
    @IBOutlet weak var friendScroller: UIScrollView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        FirebaseService.getInstance().getFriends(onCompletion: {friends in
            if friends.count == 0 {
                self.noFriendsLbl.isHidden = false
            } else {
                self.noFriendsLbl.isHidden = true
                
                let padding = CGFloat(5)
                let width = self.friendScroller.frame.width / 4
                var x = padding
                var y = padding
                for friend in friends {
                    let frame = CGRect(x: x, y: y, width: width, height: width)
                    let avatar = AvatarBadge(frame: frame)
                    let name = LanguageService.getInstance().shortenName(name: friend.name)
                    avatar.setLabel(text: name)
                    if friend.photoUrl != nil {
                        let url = URL(string: friend.photoUrl!)
                        if url != nil {
                            let data = NSData(contentsOf: url!)
                            if data != nil {
                                let image = UIImage(data: data as! Data)
                                if image != nil {
                                    avatar.setProfileImage(image: image!)
                                }
                            }
                        }
                    }
                    self.friendScroller.addSubview(avatar)
                    x = x + width + padding
                    if x + width > self.friendScroller.frame.width {
                        x = padding
                        y = y + width + padding
                    }
                }
            }
        })
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func inviteButtonClicked(_ sender: Any) {
        if let invite = FIRInvites.inviteDialog() {
            invite.setInviteDelegate(self)
            let targetApplication = FIRInvitesTargetApplication()
            targetApplication.androidClientID = "com.yellowforktech.genquizitive"
            invite.setOtherPlatformsTargetApplication(targetApplication)
            
            // NOTE: You must have the App Store ID set in your developer console project
            // in order for invitations to successfully be sent.
            
            // A message hint for the dialog. Note this manifests differently depending on the
            // received invitation type. For example, in an email invite this appears as the subject.
            invite.setMessage("\(GIDSignIn.sharedInstance().currentUser.profile.name) Challenged you to a GenQuiz")
            // Title for the dialog, this is what the user sees before sending the invites.
            invite.setTitle("GenQuiz Challenge")
            invite.setDeepLink("app_url")
            invite.setCallToActionText("Play!")
            invite.setCustomImage("https://www.genquizitive.com/logo.png")
            invite.open()
        }
    }
}
