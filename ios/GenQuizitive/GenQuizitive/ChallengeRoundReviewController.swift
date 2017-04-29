import Foundation
import UIKit
import GoogleSignIn
import Firebase
import FirebaseAuthUI
import FirebaseGoogleAuthUI

class ChallengeRoundReviewViewController: UIViewController {
    
    @IBOutlet weak var flight6: UIImageView!
    @IBOutlet weak var flight5: UIImageView!
    @IBOutlet weak var flight4: UIImageView!
    @IBOutlet weak var flight3: UIImageView!
    @IBOutlet weak var flight2: UIImageView!
    @IBOutlet weak var flight1: UIImageView!
    @IBOutlet weak var friendTimerLbl: UILabel!
    @IBOutlet weak var friendAvatar: AvatarBadge!
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
                        let image = UIImage(data: imageData! as Data)
                        if image != nil {
                            self.avatar.setProfileImage(image: image!)
                        }
                    }
                }
            }
        })
    }
    
    func addRow(question:Question, y: CGFloat, delay: Int) -> ChallengeReviewRow {
        let frame = CGRect(x: 0, y: scroller.frame.height, width: scroller.frame.width, height: 75)
        let row = ChallengeReviewRow(frame: frame)
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
        let flights = [flight1,flight2,flight3,flight4,flight5,flight6]
        
        if genQuiz != nil {
            let max = min(genQuiz!.myTotalIncorrect, lights.count)
            for i in 0..<max  {
                lights[i]?.image = UIImage(named: "red_light_on")
            }
            
            let fmax = min(genQuiz!.friendTotalIncorrect, flights.count)
            for i in 0..<fmax  {
                flights[i]?.image = UIImage(named: "red_light_on")
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
            
            let fminutes = Int(genQuiz!.friendTotalTime / 60)
            let fseconds = Int(genQuiz!.friendTotalTime - Double(fminutes * 60))
            var fsecText = "\(fseconds)"
            if fseconds < 10 {
                fsecText = "0\(fseconds)"
            }
            var fminText = "\(fminutes)"
            if fminutes < 10 {
                fminText = "0\(fminutes)"
            }
            friendTimerLbl.text = "\(fminText):\(fsecText)"
            
            var friendId = genQuiz?.toId
            if genQuiz?.toId == firebaseService.userDetails?.id {
                friendId = genQuiz?.fromId
            }
            if friendId != nil {
                firebaseService.getUserDetailsById(userId: friendId!, onCompletion: {friend in
                    if friend != nil {
                        let name = LanguageService.getInstance().shortenName(name: friend!.name)
                        self.friendAvatar.setLabel(text: name)
                        let url = URL(string: friend!.photoUrl!)
                        if url != nil {
                            let imageData = NSData(contentsOf: url!)
                            if imageData != nil {
                                let image = UIImage(data: imageData! as Data)
                                if image != nil {
                                    self.friendAvatar.setProfileImage(image: image!)
                                }
                            }
                        }
                    }
                })
            }
            
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
