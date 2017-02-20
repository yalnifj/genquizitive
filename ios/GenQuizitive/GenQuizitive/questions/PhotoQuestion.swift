//
//  PhotoQuestion.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/20/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class PhotoQuestion : Question {
    var person:Person?
    
    override func setup(onCompletion: (Question?, Error?) -> Void) {
        
    }
}

class PhotoQuestionView : UIView {
    
    var view:UIView!
    @IBOutlet weak var redBackground: UIView!
    @IBOutlet weak var photoImage: UIImageView!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var questionTextShadow: UIView!
    @IBOutlet weak var answerBtn1: UIButton!
    @IBOutlet weak var answerBtn2: UIButton!
    @IBOutlet weak var answerBtn3: UIButton!
    @IBOutlet weak var answerBtn4: UIButton!
    
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
        view.frame = bounds
        view.autoresizingMask = UIViewAutoresizing.flexibleWidth
        addSubview(view)
        
        redBackground.layer.cornerRadius = 15
        redBackground.clipsToBounds = true
        
        photoImage.layer.cornerRadius = 15
        photoImage.clipsToBounds = true
        
        questionText.layer.cornerRadius = 20
        questionText.clipsToBounds = true
        
        questionTextShadow.layer.cornerRadius = 20
        questionTextShadow.clipsToBounds = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "PhotoQuestion", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

    func setPhotoImage(photo:UIImage) {
        photoImage.image = photo
        self.view.layoutIfNeeded()
    }
    @IBAction func answerBtn1Click(_ sender: Any) {
    }
    @IBAction func answerBtn2Click(_ sender: Any) {
    }
    @IBAction func answerBtn3Click(_ sender: Any) {
    }
    @IBAction func answerBtn4Click(_ sender: Any) {
    }
    
}
