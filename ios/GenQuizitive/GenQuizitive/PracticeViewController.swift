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
    
    override func viewDidLoad() {
        super.viewDidLoad()
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
    
    func onEvent(_ topic:String, data:Any?) {
        
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
    
    var listenerIndex:Int?
    func setListenerIndex(_ index:Int) {
        listenerIndex = index
    }
    
}
