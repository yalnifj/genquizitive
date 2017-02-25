//
//  LoadingView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/23/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class LoadingView: UIView {
    
    @IBOutlet weak var loadingImg: UIImageView!
    var view:UIView?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    func setup() {
        view = loadViewFromNib()
        view!.frame = bounds
        view!.autoresizingMask = UIViewAutoresizing.flexibleWidth
        addSubview(view!)
        
        var loadingImages = [UIImage]()
        loadingImages.append(UIImage(named: "loading1")!)
        loadingImages.append(UIImage(named: "loading2")!)
        loadingImages.append(UIImage(named: "loading3")!)
        loadingImg.animationImages = loadingImages
        loadingImg.animationDuration = 1.5
        loadingImg.startAnimating()
        
        self.view!.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "LoadingView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

}
