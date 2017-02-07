//
//  MenuViewController.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/7/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import FacebookCore

class MenuViewController: UIViewController {
    
    @IBOutlet weak var arrows: UIImageView!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var arrowsArr = [UIImage]()
        arrowsArr.append(UIImage(named: "home_arrow3")!)
        arrowsArr.append(UIImage(named: "home_arrow2")!)
        arrowsArr.append(UIImage(named: "home_arrow1")!)
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
