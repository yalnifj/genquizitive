//
//  QuestionService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/20/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class Question {
    var name:String!
    var letter:String!
    var background:String!
    var difficulty:Int = 1
    var hints:[String]!
    
    var questionText:String!
    
    func setup(difficulty:Int, useLiving:Bool, onCompletion: (Question, Error?)->Void) {
        onCompletion(self, NSError(domain: "Question", code: 1, userInfo: ["message":"Setup method must be overridden in a subclass"]))
    }
}

class MultipleChoiceQuestion : Question {
    var person:Person?
    var answerPeople:[Person]!
}

class QuestionService {
    
}
