//
//  ViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 10/15/16.
//  Copyright © 2016 Yellow Fork Technologies. All rights reserved.
//

import Foundation
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
    var loadingView:LoadingView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow1")!)
        arrows.animationImages = arrowsArr
        arrows.animationDuration = 1.0
        arrows.startAnimating()
        
        funLabel.layer.cornerRadius = 10
        funLabel.clipsToBounds = true
        funLabel.layer.borderColor = UIColor.black.cgColor
        funLabel.layer.borderWidth = 1
        
        facebookButton.titleLabel?.textAlignment = .center
        familysearchButton.titleLabel?.textAlignment = .center
    }
    
    override func viewDidAppear(_ animated: Bool) {
        let accessToken = UserDefaults.standard.string(forKey: "accessToken")
        if accessToken != nil {
            print("Already Logged into FamilySearch with access_token \(accessToken)")
            showLoading()
            service = FamilySearchService(env: "integration", applicationKey: "a02j000000KSRxHAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
            service?.sessionId = accessToken
            FamilyTreeService.getInstance().remoteService = service
            FamilyTreeService.getInstance().loadInitialData(onCompletion: {person, err in
                if person != nil {
                    print("found current person")
                } else if err != nil && err?.code == 401 {
                    print("access token invalid")
                    self.service?.sessionId = nil
                    FamilyTreeService.getInstance().remoteService = nil
                    UserDefaults.standard.removeObject(forKey: "accessToken")
                }
                //self.authFacebook()
            })
        } else {
            //authFacebook()
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func gotoMenuView() {
        let viewController:MenuViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "MenuViewController") as! MenuViewController
        
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
                
                UserDefaults.standard.set(accessToken, forKey: "fbAccessToken")
                
                self.gotoMenuView()
            }
        }
    }

    @IBAction func onFSBtnClick(_ sender: Any) {
        //ios key a02j000000KSRxHAAX
        //web key a02j000000JERmSAAX
        service = FamilySearchService(env: "integration", applicationKey: "a02j000000KSRxHAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
        authDialog = AuthDialogView(frame: self.view.bounds)
        authDialog?.remoteService = service
        authDialog?.listener = self
        self.view.addSubview(authDialog!)
        
        authDialog?.startOAuth()
    }
    
    func showLoading() {
        let x = (self.view.frame.width - 250) / 2
        let frame = CGRect(x: x, y: self.view.frame.height, width: 250, height: self.view.frame.height/2)
        loadingView = LoadingView(frame: frame)
        self.view.addSubview(loadingView!)
        
        UIView.animate(withDuration: 0.5,
                       delay: 0,
                       options: UIViewAnimationOptions.curveEaseIn,
                       animations: { () -> Void in
                        self.loadingView!.frame = CGRect(x: self.loadingView!.frame.origin.x, y: self.view.frame.height - 250, width: self.loadingView!.frame.width, height: self.loadingView!.frame.height)
                        self.loadingView!.superview?.layoutIfNeeded()
        },
                       completion: { (finished) -> Void in
        }
        )
    }
    
    func hideLoading() {
        if self.loadingView != nil {
            UIView.animate(withDuration: 0.5,
                           delay: 0,
                           options: UIViewAnimationOptions.curveEaseIn,
                           animations: { () -> Void in
                            self.loadingView!.frame = CGRect(x: self.loadingView!.frame.origin.x, y: self.view.frame.height, width: self.loadingView!.frame.width, height: self.loadingView!.frame.height)
                            self.loadingView!.superview?.layoutIfNeeded()
            },
                           completion: { (finished) -> Void in
                            self.loadingView = nil
            }
            )
        }
    }

    
    func AuthComplete(acessToken accessToken:String?) {
        DispatchQueue.main.async {
            self.authDialog?.removeFromSuperview()
            //-- store access token
            if accessToken != nil {
                FamilyTreeService.getInstance().remoteService = self.service
                FamilyTreeService.getInstance().loadInitialData(onCompletion: {person, err in
                    if person != nil {
                        UserDefaults.standard.set(accessToken, forKey: "accessToken")
                        self.gotoMenuView()
                    }
                })
                
            }
        }
    }
    
    func AuthCanceled() {
        DispatchQueue.main.async {
            self.authDialog?.removeFromSuperview()
        }
    }
    
    func onAuthError(errorMessage:String) {
        showNotification(title: "Authentication Error", message: errorMessage)
    }
    
    func showNotification(title:String, message:String) {
        DispatchQueue.main.async {
            let screenSize = UIScreen.main.bounds
            var width = screenSize.width * 0.90
            if screenSize.width > screenSize.height {
                width = screenSize.height * 0.90
            }
            let ratio = CGFloat(200.0 / 350.0)
            let height = width * ratio
            let frame = CGRect(x: 10, y: 10, width: width, height: height)
            let notif = NotificationView(frame: frame)
            self.view.addSubview(notif)
            notif.showMessage(title: title, message: message, showButton: true, duration: 0.5)
        }
    }
}

