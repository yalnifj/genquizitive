import Foundation
import UIKit
import GoogleSignIn
import Firebase
import FirebaseAuthUI
import FirebaseGoogleAuthUI

class PracticeRoundReviewViewController: UIViewController, FUIAuthDelegate, GIDSignInUIDelegate {
	
    @IBOutlet weak var avatar: AvatarBadge!
    @IBOutlet weak var timerLbl: UILabel!
    @IBOutlet weak var light1: UIImageView!
    @IBOutlet weak var light2: UIImageView!
    @IBOutlet weak var light3: UIImageView!
    @IBOutlet weak var light4: UIImageView!
    @IBOutlet weak var light5: UIImageView!
    @IBOutlet weak var light6: UIImageView!
    @IBOutlet weak var scroller: UIScrollView!
    
    var genQuiz:GenQuizRound?
    var firebaseService:FirebaseService!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.firebaseService = FirebaseService.getInstance()
        
        let familyTreeService = FamilyTreeService.getInstance()
        familyTreeService.getPersonPortrait(personId: familyTreeService.fsUser!.id, onCompletion: {path in
            if path != nil {
                self.avatar.showPerson(person: familyTreeService.fsUser!, isAncestor: false, showName: false)
            } else {
                if self.firebaseService.firebaseUser != nil && self.firebaseService.firebaseUser?.photoURL != nil {
                    let imageData = NSData(contentsOf: self.firebaseService.firebaseUser!.photoURL!)
                    if imageData != nil {
                        let image = UIImage(data: imageData as! Data)
                        if image != nil {
                            self.avatar.setProfileImage(image: image!)
                        }
                    }
                }
            }
        })
        
        GIDSignIn.sharedInstance().uiDelegate = self
        GIDSignIn.sharedInstance().signIn()
    }
    
    func addRow(question:Question, y: CGFloat, delay: Int) -> PracticeReviewRow {
        let frame = CGRect(x: 0, y: scroller.frame.height, width: scroller.frame.width, height: 75)
        let row = PracticeReviewRow(frame: frame)
        row.showQuestion(question: question)
        scroller.addSubview(row)
        
        UIView.animate(withDuration: 1.0,
            delay: Double(delay) / 2.0,
            options: UIViewAnimationOptions.curveEaseIn,
            animations: { () -> Void in
                row.frame = CGRect(x: 0, y: y, width: row.frame.width, height: row.frame.height)
                row.superview?.layoutIfNeeded()
            },
            completion: { (finished) -> Void in
            }
        )

        return row
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewWillAppear(_ animated:Bool) {
        super.viewWillAppear(animated)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        let lights = [light1,light2,light3,light4,light5,light6]
        
        if genQuiz != nil {
            let max = min(genQuiz!.myTotalIncorrect, lights.count)
            for i in 0..<max  {
                lights[i]?.image = UIImage(named: "red_light_on")
            }
            
            let minutes = Int(genQuiz!.myTotalTime / 60)
            let seconds = Int(genQuiz!.myTotalTime - Double(minutes * 60))
            var secText = "\(seconds)"
            if seconds < 10 {
                secText = "0\(seconds)"
            }
            var minText = "\(minutes)"
            if minutes < 10 {
                minText = "0\(minutes)"
            }
            timerLbl.text = "\(minText):\(secText)"
            
            var y:CGFloat = 0
            var count = 0
            for question in genQuiz!.questions {
                let row = self.addRow(question: question, y: y, delay: count)
                y = y + row.frame.height + 5
                count += 1
            }
        }
    }
    
    override func viewWillDisappear(_ animated:Bool) {
        super.viewWillDisappear(animated)
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
        }
    }
    
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
                self.showNotification(title: "Database Error", message: "There was an error connecting to the database. \(error)")
                return
            }
            
            if user2 != nil {
                let firebaseService = FirebaseService.getInstance()
                firebaseService.firebaseUser = user2
                firebaseService.persistGoogleUser(user: user, hasFamilyTree: true)
            }
        }
    }
    
    func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
        // Perform any operations when the user disconnects from app here.
        // ...
    }
    
    @IBAction func playAgainClick(_ sender: Any) {
        if FirebaseService.getInstance().firebaseUser != nil {
            let viewController:ChallengeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ChallengeViewController") as! ChallengeViewController
            viewController.genQuiz = self.genQuiz
            
            self.present(viewController, animated: false, completion: nil)
        } else {
            let authUI = FUIAuth.defaultAuthUI()
            let providers: [FUIAuthProvider] = [
                FUIGoogleAuth()
            ]
            authUI?.providers = providers
            let kFirebaseTermsOfService = URL(string: "https://www.genquizitive.com/privacy.html")!
            authUI?.tosurl = kFirebaseTermsOfService

            // Present the auth view controller and then implement the sign in callback.
            let authViewController = authUI!.authViewController()
            self.present(authViewController, animated: false, completion: nil)
        }
    }
    
    @IBAction func backToMenuClick(_ sender: Any) {
        let viewController:UIViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "MenuViewController") as UIViewController
        
        self.present(viewController, animated: false, completion: nil)

    }

}
