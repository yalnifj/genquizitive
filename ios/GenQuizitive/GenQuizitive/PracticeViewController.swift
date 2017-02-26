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
    var questionView:UIView?
    
    var questions = [Question]()
    var currentQuestion:Int = 0
    var maxQuestions = 5
    var setupCount = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let question = QuestionService.getInstance().getRandomQuestion()
        questions.append(question)
        setupQuestion(num: currentQuestion)
        let question2 = QuestionService.getInstance().getRandomQuestion()
        //-- prevent 2 of the same question types in a row
        /*while question2.name == question.name {
            question2 = QuestionService.getInstance().getRandomQuestion()
        }*/
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
        showNotification(title: "Practice GenQuiz", message: "Practice a GenQuiz on your family tree then challenge your family and friends. Answer the questions as quickly as you can.  Try not to make any mistakes or you will receive a time penalty.")
    }
    
    override func viewWillDisappear(_ animated:Bool) {
        EventHandler.getInstance().unSubscribe("questionCorrect", listener: self)
        EventHandler.getInstance().unSubscribe("questionIncorrect", listener: self)
    }
    
    func setupQuestion(num:Int) {
        print("Setting up question \(num)")
        let question = questions[num]
        question.setup(difficulty: num+1, useLiving: true, onCompletion: {question, err in
            if err != nil {
                print("Error setting up question \(question.name) \(err!)")
                FamilyTreeService.getInstance().clearUsed()
                self.setupCount += 1
                if self.setupCount < 5 {
                    self.setupQuestion(num: num)
                } else {
                    print("Unable to setup question \(question.name).  Giving up after 5 tries.")
                    self.setupCount = 0
                    self.questions[num] = QuestionService.getInstance().getRandomQuestion()
                    self.setupQuestion(num: num)
                }
            } else {
                if num == self.currentQuestion && self.loadingView != nil {
                    self.showCurrentQuestion()
                }
            }
        })
    }
    
    func nextQuestion() {
        currentQuestion += 1
        if currentQuestion < maxQuestions-1 {
            let question = QuestionService.getInstance().getRandomQuestion()
            //-- prevent 2 of the same question types in a row
            /*while question2.name == question.name {
             question2 = QuestionService.getInstance().getRandomQuestion()
             }*/
            questions.append(question)
            showCurrentQuestion()
        } else if currentQuestion < maxQuestions {
            showCurrentQuestion()
        } else {
            print("Round complete")
            // show round complete
            let viewController:UIViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "MenuViewController") as UIViewController
            
            self.present(viewController, animated: false, completion: nil)
        }
    }
    
    func onEvent(_ topic:String, data:Any?) {
        if topic == "questionIncorrect" {
            roundDetailView.addPenalty()
        } else if topic == "questionCorrect" {
            nextQuestion()
        }
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
        
        notif?.hideMessage()
        
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
                    self.showCurrentQuestion()
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

    func showCurrentQuestion() {
        //-- remove existing question
        if questionView != nil {
            let oldQuestion = questionView!
            UIView.animate(withDuration: 0.5,
                           delay: 0,
                           options: UIViewAnimationOptions.curveEaseIn,
                           animations: { () -> Void in
                            oldQuestion.frame = CGRect(x: -oldQuestion.frame.width, y: oldQuestion.frame.origin.y, width: oldQuestion.frame.width, height: oldQuestion.frame.height)
                            oldQuestion.superview?.layoutIfNeeded()
            },
                           completion: { (finished) -> Void in
                            oldQuestion.removeFromSuperview()
            }
            )
        }
        
        let question = questions[currentQuestion]
        if !question.isReady {
            questionView = nil
            self.roundDetailView.pauseTimer()
            showLoading()
        } else {
            if loadingView != nil {
                hideLoading()
            }
            if !roundDetailView.isTimerRunning {
                self.roundDetailView.startTimer()
            }
            
            if currentQuestion < maxQuestions - 1 {
                setupQuestion(num: currentQuestion + 1)
            }
            
            let x = self.view.frame.width
            let frame = CGRect(x: x, y: roundDetailView.frame.height, width: self.view.frame.width - 40, height: self.view.frame.height - roundDetailView.frame.height)
            
            print("showing question \(question.name)")
            if question.name == "photo1" {
                let photoQuestionView = PhotoQuestionView(frame: frame)
                photoQuestionView.showQuestion(question: question as! PhotoQuestion)
                questionView = photoQuestionView
            }
            
            self.view.addSubview(questionView!)
            UIView.animate(withDuration: 0.5,
                           delay: 0,
                           options: UIViewAnimationOptions.curveEaseIn,
                           animations: { () -> Void in
                            self.questionView!.frame = CGRect(x: 20, y: self.questionView!.frame.origin.y, width: self.questionView!.frame.width, height: self.questionView!.frame.height)
                            self.questionView!.superview?.layoutIfNeeded()
            },
                           completion: { (finished) -> Void in
                            
            }
            )
        }
    }
}
