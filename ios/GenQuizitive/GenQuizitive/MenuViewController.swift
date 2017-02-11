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
    @IBOutlet weak var avatarBadge: AvatarBadge!
    
    
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

        let facebookService = FacebookService.getInstance();
        facebookService.getCurrentUser { (fsUser, error) in
            if fsUser != nil {
                if fsUser?.picture != nil {
                    let url = NSURL(string: fsUser!.picture)
                    let data = NSData(contentsOf: url! as URL)
                    if data != nil {
                        let pImage = UIImage(data: data! as Data)
                        if pImage != nil {
                            self.avatarBadge.setProfileImage(image: pImage!)
                        }
                    }
                }
            }
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}
