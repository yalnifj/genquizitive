//
//  MenuViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/7/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import Firebase
//import FirebaseAuthUI
//import FirebaseGoogleAuthUI
//import FirebaseFacebookAuthUI
import GoogleSignIn

class MenuViewController: UIViewController, AuthCompleteListener, GIDSignInUIDelegate, NotificationListener {
    
    @IBOutlet weak var arrows: UIImageView!
    @IBOutlet weak var avatarBadge: AvatarBadge!
    @IBOutlet weak var fsConnectBtn: UIButton!
    
    var familyTreeService:FamilyTreeService!
    
    var service : RemoteService?

    var isUserLoggedIn = false
    //var authUI:FUIAuth?
    var authDialog:AuthDialogView?
    var moveToChallenge = false
    var moveToPlay = false
    
    var handle: FIRAuthStateDidChangeListenerHandle?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //authUI = FUIAuth.defaultAuthUI()
        //let providers: [FUIAuthProvider] = [
        //    FUIGoogleAuth(),
        //    FUIFacebookAuth()
        //]
        //authUI?.providers = providers
        //let kFirebaseTermsOfService = URL(string: "https://www.genquizitive.com/privacy.html")!
        //authUI?.tosurl = kFirebaseTermsOfService
        
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow1")!)
        arrows.animationImages = arrowsArr
        arrows.animationDuration = 1.0
        arrows.startAnimating()
        
        familyTreeService = FamilyTreeService.getInstance()
        if familyTreeService.remoteService == nil {
            let accessToken = UserDefaults.standard.string(forKey: "accessToken")
            if accessToken != nil {
                let service = FamilySearchService(env: "integration", applicationKey: "a02j000000JERmSAAX", redirectUrl: "https://www.genquizitive.com/mobile.html")
                service.sessionId = accessToken
                familyTreeService.remoteService = service
                familyTreeService.loadInitialData(onCompletion: {person, err in
                    if person != nil {
                        self.familyTreeService.getPersonPortrait(personId: person!.id, onCompletion: {path in
                            if path != nil {
                                self.avatarBadge.isHidden = false
                                
                            }
                        })
                        UserDefaults.standard.set(accessToken, forKey: "accessToken")
                        self.fsConnectBtn.isHidden = true
                    } else {
                        if err != nil {
                            print("Error loading initial data \(err!)")
                        }
                        self.fsConnectBtn.isHidden = false
                    }
                })
            } else {
                fsConnectBtn.isHidden = false
            }
            self.view.layoutIfNeeded()
        }
        
        GIDSignIn.sharedInstance().uiDelegate = self
        // -- don't force automatic sign in
        // GIDSignIn.sharedInstance().signIn()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        handle = FIRAuth.auth()?.addStateDidChangeListener() { (auth, user) in
            if user != nil {
                self.isUserLoggedIn = true
                FirebaseService.getInstance().firebaseUser = user
            }
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        FIRAuth.auth()?.removeStateDidChangeListener(handle!)
    }
    
    @IBAction func playBtnClick(_ sender: Any) {
        if familyTreeService.remoteService == nil || familyTreeService.remoteService!.sessionId == nil {
            moveToPlay = true
            self.showNotification(title: "Family Tree Required", message: "This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.", listener: self)
        } else {
            let viewController:PracticeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "PracticeViewController") as! PracticeViewController
            
            self.present(viewController, animated: false, completion: nil)
        }
        
    }
    
    @IBAction func challengeBtnClick(_ sender: Any) {
        if !isUserLoggedIn {
            // Present the auth view controller and then implement the sign in callback.
            //let authViewController = authUI!.authViewController()
            //self.present(authViewController, animated: false, completion: nil)
            showNotification(title: "Account Required", message: "An account is required to challenge friends.  Please create a GenQuizitive account to continue.", listener: self)
        } else {
            let viewController:ContinueViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ContinueViewController") as! ContinueViewController
            
            self.present(viewController, animated: false, completion: nil)
        }
    }
    
    func onComplete(result: Bool) {
        if result {
            if moveToPlay {
                showFSAuth()
            } else {
                GIDSignIn.sharedInstance().signIn()
            }
        }
    }

    @IBAction func hintBtnClick(_ sender: Any) {
        
    }
    
    @IBAction func howToPayBtnClick(_ sender: Any) {
        UIApplication.shared.openURL(URL(string: "https://www.genquizitive.com/howtoplay.html")!)
    }

    @IBAction func familysearchBtnClick(_ sender: Any) {
        showFSAuth()
    }
    
    func showFSAuth() {
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
    
    func showNotification(title:String, message:String, listener: NotificationListener) {
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
            notif.listener = listener
            self.view.addSubview(notif)
            notif.showMessage(title: title, message: message, showButton: true, duration: 0.5)
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
                        self.fsConnectBtn.isHidden = true
                        UserDefaults.standard.set(accessToken, forKey: "accessToken")
                        if self.moveToPlay {
                            let viewController:PracticeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "PracticeViewController") as! PracticeViewController
                            self.present(viewController, animated: false, completion: nil)
                            self.moveToPlay = false
                        }
                    } else if err != nil {
                        print("Error reading data from family search \(err!)")
                        self.showNotification(title: "Family Tree Error", message: "There was an error loading data from your family tree. \(err!)")
                        self.moveToPlay = false
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
    /*
    func authUI(_ authUI: FUIAuth, didSignInWith user: FIRUser?, error: Error?) {
        // handle user and error as necessary
        if let error2 = error {
            print("Error signing into firebase \(error2)")
            self.showNotification(title: "Database Error", message: "There was an error connecting to the database. \(error)")
            return
        }
        
        if user != nil {
            let firebaseService = FirebaseService.getInstance()
            firebaseService.firebaseUser = user
            if self.avatarBadge.profileImage == nil {
                if firebaseService.firebaseUser != nil && firebaseService.firebaseUser?.photoURL != nil {
                    let imageData = NSData(contentsOf: firebaseService.firebaseUser!.photoURL!)
                    if imageData != nil {
                        let image = UIImage(data: imageData as! Data)
                        if image != nil {
                            self.avatarBadge.isHidden = false
                            self.avatarBadge.setProfileImage(image: image!)
                        }
                    }
                }
            }
        }
    }
    */
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error?) {
        // ...
        if let error = error {
            print("Error signing into google \(error)")
            self.showNotification(title: "Login Error", message: "There was an error logging into your account. \(error)")
            return
        }
        
        guard let authentication = user.authentication else { return }
        let credential = FIRGoogleAuthProvider.credential(withIDToken: authentication.idToken,
                                                          accessToken: authentication.accessToken)
        FIRAuth.auth()?.signIn(with: credential) { (user2, error2) in
            // ...
            if let error2 = error2 {
                print("Error signing into firebase \(error2)")
                self.showNotification(title: "Database Error", message: "There was an error connecting to the database. \(error2)")
                self.moveToChallenge = false
                return
            }
            
            if user2 != nil {
                let firebaseService = FirebaseService.getInstance()
                firebaseService.firebaseUser = user2
                firebaseService.persistGoogleUser(user: user, hasFamilyTree: self.fsConnectBtn.isHidden)
                if self.moveToChallenge {
                    let viewController:ContinueViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ContinueViewController") as! ContinueViewController
                    self.present(viewController, animated: false, completion: nil)
                }
                else if self.avatarBadge.profileImage == nil {
                    if firebaseService.firebaseUser != nil && firebaseService.firebaseUser?.photoURL != nil {
                        let imageData = NSData(contentsOf: firebaseService.firebaseUser!.photoURL!)
                        if imageData != nil {
                            let image = UIImage(data: imageData! as Data)
                            if image != nil {
                                self.avatarBadge.isHidden = false
                                self.avatarBadge.setProfileImage(image: image!)
                            }
                        }
                    }
                }

            }
        }
    }
    
    func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
        // Perform any operations when the user disconnects from app here.
        // ...
    }
}
