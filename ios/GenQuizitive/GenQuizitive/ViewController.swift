//
//  ViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 10/15/16.
//  Copyright © 2016 Yellow Fork Technologies. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet weak var arrows: UIImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow1")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrows.animationImages = arrowsArr
        arrows.animationDuration = 0.3
        arrows.animationDuration = 1.0
        arrows.startAnimating()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

