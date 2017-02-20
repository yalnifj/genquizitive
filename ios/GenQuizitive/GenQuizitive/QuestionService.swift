//
//  QuestionService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/20/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class Question {
    var difficulty:Int = 1
    var questionText:String!
    
    func setup(onCompletion: (Question?, Error?)->Void) {
        onCompletion(self, NSError(domain: "Question", code: 1, userInfo: ["message":"Setup method must be overridden in a subclass"]))
    }
}

class QuestionService {
    
}
