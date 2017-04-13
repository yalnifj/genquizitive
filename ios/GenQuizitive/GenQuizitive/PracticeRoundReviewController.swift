import Foundation
import UIKit

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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let facebookService = FacebookService.getInstance();
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
                                    self.avatar.setProfileImage(image: pImage!)
                                }
                            }
                        }
                    }
                }
            }
            self.view.layoutIfNeeded()
        })
        
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
            for question in genQuiz!.questions {
                let frame = CGRect(x: 0, y: y, width: scroller.frame.width, height: 75)
                let row = PracticeReviewRow(frame: frame)
                row.showQuestion(question: question)
                scroller.addSubview(row)
                
                y = y + frame.height + 5
            }
        }
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
