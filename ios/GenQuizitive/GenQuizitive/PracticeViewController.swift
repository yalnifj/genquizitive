//
//  PracticeViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/21/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class PracticeViewController: UIViewController, EventListener {
    
    @IBOutlet weak var startHolder: UIView!
    @IBOutlet weak var startBtn: UIButton!
    @IBOutlet weak var countDownImg: UIImageView!
    @IBOutlet weak var roundDetailView: RoundDetailView!
    
    var notif:NotificationView?
    var loadingView:LoadingView?
    
    var questions = [Question]()
    var currentQuestion:Int = 0
    var maxQuestions = 5
    var setupCount = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var question = QuestionService.getInstance().getRandomQuestion()
        questions.append(question)
        setupQuestion(currentQuestion)
        var question2 = QuestionService.getInstance().getRandomQuestion()
        questions.append(question2)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewWillAppear(_ animated:Bool) {
        EventHandler.getInstance().subscribe("questionCorrect", listener: self)
        EventHandler.getInstance().subscribe("questionIncorrect", listener: self)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        showNotification(title: "", message: "")
    }
    
    override func viewWillDisappear(_ animated:Bool) {
        EventHandler.getInstance().unSubscribe("questionCorrect", listener: self)
        EventHandler.getInstance().unSubscribe("questionIncorrect", listener: self)
    }
    
    func setupQuestion(num:Int) {
        print("Setting up question \(num)")
        var question = questions[num]
        question.setup(difficulty: num+1, useLiving: true, onCompletion: {question, err in
            if err != nil {
                print("Error setting up question \(question.name) \(err!)")
                setupCount += 1
                if setupCount < 5 {
                    self.setupQuestion()
                } else {
                    print("Unable to setup question \(question.name).  Giving up after 5 tries.")
                    setupCount = 0
                    questions[num] = QuestionService.getInstance().getRandomQuestion()
                    self.setupQuestion()
                }
            }
        })
    }
    
    func nextQuestion() {
        currentQuestion += 1
        if currentQuestion < maxQuestions-1 {
            var question = QuestionService.getInstance().getRandomQuestion()
            questions.append(question)
            setupQuestion(num: currentQuestion + 1)
            
        } else if currentQuestion < maxQuestions {
            
        } else {
            print("Round complete")
            // show round complete
        }
    }
    
    func onEvent(_ topic:String, data:Any?) {
        
    }
    var listenerIndex:Int?
    func setListenerIndex(_ index:Int) {
        listenerIndex = index
    }
    
    @IBAction func startBtnClick(_ sender: Any) {
        startBtn.isHidden = true
        countDownImg.isHidden = false
        var numbers = [UIImage]()
        numbers.append(UIImage(named: "number3")!)
        numbers.append(UIImage(named: "number2")!)
        numbers.append(UIImage(named: "number1")!)
        countDownImg.animationImages = numbers
        countDownImg.animationDuration = 3.0
        countDownImg.animationRepeatCount = 1
        countDownImg.startAnimating()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            UIView.animate(withDuration: 0.5,
               delay: 0,
               options: UIViewAnimationOptions.curveEaseIn,
               animations: { () -> Void in
                    self.startHolder.frame = CGRect(x: self.startHolder.frame.origin.x, y: self.view.frame.height, width: self.startHolder.frame.width, height: self.startHolder.frame.height)
                    self.startHolder.superview?.layoutIfNeeded()
               },
               completion: { (finished) -> Void in
                    self.roundDetailView.isHidden = false
                    self.startHolder.removeFromSuperview()
               }
            )

        }
    }
    
    func showNotification(title:String, message:String) {
        let screenSize = UIScreen.main.bounds
        let width = screenSize.width * 0.90
        let ratio = CGFloat(200.0 / 350.0)
        let height = width * ratio
        let frame = CGRect(x: 10, y: 10, width: width, height: height)
        notif = NotificationView(frame: frame)
        self.view.addSubview(notif!)
        notif!.showMessage(title: title, message: message, showButton: false, duration: 0.7)
    }
    
    func showLoading() {
        let x = (self.view.frame.width - 250) / 2
        let frame = CGRect(x: x, y: self.view.frame.height, width: 250, height: 350)
        loadingView = NotificationView(frame: frame)
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
            }
            )
        }
    }

}
