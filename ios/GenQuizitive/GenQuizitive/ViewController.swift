//
//  ViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 10/15/16.
//  Copyright © 2016 Yellow Fork Technologies. All rights reserved.
//

import UIKit
import FacebookCore
import FacebookLogin

class ViewController: UIViewController {
    @IBOutlet weak var arrows: UIImageView!
    @IBOutlet weak var funLabel: UILabel!
    @IBOutlet weak var facebookButton: UIButton!
    @IBOutlet weak var familysearchButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow1")!)
        arrows.animationImages = arrowsArr
        arrows.animationDuration = 0.3
        arrows.animationDuration = 1.0
        arrows.startAnimating()
        
        funLabel.layer.cornerRadius = 10
        funLabel.clipsToBounds = true
        funLabel.layer.borderColor = UIColor.black.cgColor
        funLabel.layer.borderWidth = 1
        
        facebookButton.titleLabel?.textAlignment = .center
        familysearchButton.titleLabel?.textAlignment = .center
        
        if let accessToken = AccessToken.current {
            // User is logged in, use 'accessToken' here.
            print("Already logged in to facebook \(accessToken)")
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func onFBBtnClick(_ sender: Any) {
        let loginManager = LoginManager()
        loginManager.logIn([ .publicProfile, .email, .userFriends ], viewController: self) { loginResult in
            switch loginResult {
            case .failed(let error):
                print(error)
            case .cancelled:
                print("User cancelled login.")
            case .success(let grantedPermissions, let declinedPermissions, let accessToken):
                print("Logged in!")
            }
        }
    }

    @IBAction func onFSBtnClick(_ sender: Any) {
    }
}

