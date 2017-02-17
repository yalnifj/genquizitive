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

class ViewController: UIViewController, AuthCompleteListener {
    @IBOutlet weak var arrows: UIImageView!
    @IBOutlet weak var funLabel: UILabel!
    @IBOutlet weak var facebookButton: UIButton!
    @IBOutlet weak var familysearchButton: UIButton!
    
    var service : RemoteService?
    
    var authDialog:AuthDialogView?
    
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
        
        if FacebookService.getInstance().isAuthenticated() {
            // User is logged in, use 'accessToken' here.
            print("Already logged in to facebook")
            
            self.gotoMenuView()
        } else {
            print("Not logged into facebook")
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func gotoMenuView() {
        let viewController:UIViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "MenuViewController") as UIViewController
        
        self.present(viewController, animated: false, completion: nil)
    }

    @IBAction func onFBBtnClick(_ sender: Any) {
        let loginManager = LoginManager(loginBehavior: .systemAccount, defaultAudience: .friends)
        loginManager.logIn([ .publicProfile, .email, .userFriends ], viewController: self) { loginResult in
            switch loginResult {
            case .failed(let error):
                print(error)
            case .cancelled:
                print("User cancelled login.")
            case .success(let grantedPermissions, let declinedPermissions, let accessToken):
                print("Logged in! \(accessToken)")
                
                self.gotoMenuView()
            }
        }
    }

    @IBAction func onFSBtnClick(_ sender: Any) {
        service = FamilySearchService(env: "integration", applicationKey: "a02j000000JERmSAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
        authDialog = AuthDialogView(frame: self.view.bounds)
        authDialog?.remoteService = service
        authDialog?.listener = self
        self.view.addSubview(authDialog!)
    }
    
    func AuthComplete(accessToken:String?) {
        authDialog?.removeFromSuperview()
    }
    
    func AuthCanceled() {
        authDialog?.removeFromSuperview()
    }
}

