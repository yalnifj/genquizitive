//
//  ContinueViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/15/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class ContinueViewController: UIViewController, EventListener {
    
    @IBOutlet weak var genquizScroller: UIScrollView!
    
    @IBOutlet weak var noRoundsMessage: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        FirebaseService.getInstance().getRoundsForUser(userId: FirebaseService.getInstance().userDetails!.id, onCompletion: { rounds in
            if rounds.count == 0 {
                self.noRoundsMessage.isHidden = false
            } else {
                self.noRoundsMessage.isHidden = true
                var y = CGFloat(0)
                var height = CGFloat(80)
                for genQuiz in rounds {
                    let frame = CGRect(x: CGFloat(0), y: y, width: self.genquizScroller.frame.width, height: height)
                    var row = GenQuizRowView(frame: frame)
                    row.showGenQuizRound(genQuiz: genQuiz)
                    self.genquizScroller.addSubview(row)
                    y = y + height + CGFloat(5)
                }
                self.genquizScroller.layoutSubviews()
            }
        })
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewWillAppear(_ animated:Bool) {
        EventHandler.getInstance().subscribe(GenQuizRowView.TOPIC_GENQUIZ_SELECTED, listener: self)
    }
    
    override func viewWillDisappear(_ animated:Bool) {
        EventHandler.getInstance().unSubscribe(GenQuizRowView.TOPIC_GENQUIZ_SELECTED, listener: self)
    }

    func onEvent(_ topic:String, data:Any?) {
        if topic == GenQuizRowView.TOPIC_GENQUIZ_SELECTED && data != nil {
            let genQuizRow = data as! GenQuizRowView
            let genQuiz = genQuizRow.genQuiz
            if genQuiz != nil {
                if genQuiz?.myTotalTime != 0 && genQuiz?.friendTotalTime == 0 {
                    //-- go to challenge review
                    let viewController:ChallengeRoundReviewViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ChallengeRoundReviewViewController") as! ChallengeRoundReviewViewController
                    
                    viewController.genQuiz = genQuiz
                    self.present(viewController, animated: false, completion: nil)
                }
                else if genQuiz?.myTotalTime == 0 {
                    let viewController:PracticeViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "PracticeViewController") as! PracticeViewController
                    
                    viewController.genQuiz = genQuiz
                    self.present(viewController, animated: false, completion: nil)
                } else {
                    //-- go to challenge review
                    let viewController:ChallengeRoundReviewViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ChallengeRoundReviewViewController") as! ChallengeRoundReviewViewController
                    
                    viewController.genQuiz = genQuiz
                    self.present(viewController, animated: false, completion: nil)
                }
            }
        }
    }
    var listenerIndex:Int?
    func setListenerIndex(_ index:Int) {
        listenerIndex = index
    }
}
