//
//  MenuViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/7/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import FacebookCore
import FacebookCore
import FacebookLogin

class MenuViewController: UIViewController, AuthCompleteListener {
    
    @IBOutlet weak var arrows: UIImageView!
    @IBOutlet weak var avatarBadge: AvatarBadge!
    @IBOutlet weak var fsConnectBtn: UIButton!
    @IBOutlet weak var fbConnectButton: UIButton!
    
    var familyTreeService:FamilyTreeService!
    var facebookService:FacebookService!
    var facebookIsAuth:Bool = false
    
    var service : RemoteService?
    
    var authDialog:AuthDialogView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow1")!)
        arrows.animationImages = arrowsArr
        arrows.animationDuration = 1.0
        arrows.startAnimating()
        
        fbConnectButton.titleLabel?.textAlignment = .center
        fsConnectBtn.titleLabel?.textAlignment = .center
        
        familyTreeService = FamilyTreeService.getInstance()
        if familyTreeService.remoteService == nil {
            let accessToken = UserDefaults.standard.string(forKey: "accessToken")
            if accessToken != nil {
                let service = FamilySearchService(env: "integration", applicationKey: "a02j000000JERmSAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
                service.sessionId = accessToken
                familyTreeService.remoteService = service
            } else {
                fsConnectBtn.isHidden = false
            }
            self.view.layoutIfNeeded()
        }


        facebookService = FacebookService.getInstance();
        facebookService.isAuthenticated(onCompletion: {isAuth in
            self.facebookIsAuth = isAuth
            if isAuth {
                self.facebookService.getCurrentUser { (fsUser, error) in
                    if fsUser != nil {
                        if fsUser?.picture != nil {
                            let url = NSURL(string: fsUser!.picture)
                            let data = NSData(contentsOf: url! as URL)
                            if data != nil {
                                let pImage = UIImage(data: data! as Data)
                                if pImage != nil {
                                    self.avatarBadge.setProfileImage(image: pImage!)
                                }
                            }
                        }
                    } else {
                        self.fbConnectButton.isHidden = false
                    }
                }
            } else {
                self.fbConnectButton.isHidden = false
            }
            self.view.layoutIfNeeded()
        })
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func practiceBtnClick(_ sender: Any) {
        if familyTreeService.remoteService == nil || familyTreeService.remoteService!.sessionId == nil {
            self.showNotification(title: "Family Tree Required", message: "This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.")
        } else {
            let viewController:PracticeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "PracticeViewController") as! PracticeViewController
            
            self.present(viewController, animated: false, completion: nil)
        }
        
    }
    
    @IBAction func challengeBtnClick(_ sender: Any) {
        if !self.facebookIsAuth {
            self.showNotification(title: "Social Network Required", message: "This feature requires a connection to a Social Network. Please connect to Facebook and try again.")
        }
    }
    
    @IBAction func continueBtnClick(_ sender: Any) {
        if !self.facebookIsAuth {
            self.showNotification(title: "Social Network Required", message: "This feature requires a connection to a Social Network. Please connect to Facebook and try again.")
        }
    }
    
    @IBAction func hintBtnClick(_ sender: Any) {
       
    }
    
    @IBAction func facebookBtnClick(_ sender: Any) {
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
                
                self.fsConnectBtn.isHidden = true
            }
        }
    }
    
    @IBAction func familysearchBtnClick(_ sender: Any) {
        //ios key a02j000000KSRxHAAX
        //web key a02j000000JERmSAAX
        service = FamilySearchService(env: "integration", applicationKey: "a02j000000KSRxHAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
        authDialog = AuthDialogView(frame: self.view.bounds)
        authDialog?.remoteService = service
        authDialog?.listener = self
        self.view.addSubview(authDialog!)
        
        authDialog?.startOAuth()
    }
    
    func showNotification(title:String, message:String) {
        DispatchQueue.main.async {
            let screenSize = UIScreen.main.bounds
            let width = screenSize.width * 0.90
            let ratio = CGFloat(200.0 / 350.0)
            let height = width * ratio
            let frame = CGRect(x: 10, y: 10, width: width, height: height)
            let notif = NotificationView(frame: frame)
            self.view.addSubview(notif)
            notif.showMessage(title: title, message: message, showButton: true, duration: 0.5)
        }
    }
    
    func AuthComplete(acessToken accessToken:String?) {
        DispatchQueue.main.async {
            self.authDialog?.removeFromSuperview()
            //-- store access token
            if accessToken != nil {
                self.fsConnectBtn.isHidden = true
                FamilyTreeService.getInstance().remoteService = self.service
                FamilyTreeService.getInstance().loadInitialData(onCompletion: {person, err in
                    if person != nil {
                        UserDefaults.standard.set(accessToken, forKey: "accessToken")
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
    
}
