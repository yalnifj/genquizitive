import Foundation
import UIKit
import GoogleSignIn

class PracticeRoundReviewViewController: UIViewController {
	
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
            for i in 0..<genQuiz!.myTotalIncorrect {
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
    
    @IBAction func playAgainClick(_ sender: Any) {
        let viewController:PracticeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "PracticeViewController") as! PracticeViewController
        
        self.present(viewController, animated: false, completion: nil)
    }
    
    @IBAction func backToMenuClick(_ sender: Any) {
        let viewController:UIViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "MenuViewController") as UIViewController
        
        self.present(viewController, animated: false, completion: nil)

    }

}
