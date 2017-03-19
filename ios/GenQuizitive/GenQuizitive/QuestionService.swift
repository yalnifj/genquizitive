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
    var isReady = false
    
    var questionText:String!
    
    func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?)->Void) {
        onCompletion(self, NSError(domain: "Question", code: 1, userInfo: ["message":"Setup method must be overridden in a subclass"]))
    }
}

class MultipleChoiceQuestion : Question {
    var person:Person?
    var answerPeople:[Person]!
}

class QuestionService {
 
    var questionTypes = ["photo1", "fact", "relationship", "timeline"]
    
    private static var instance:QuestionService?
    
    private init() {
        
    }
    
    static func getInstance() -> QuestionService {
        if instance == nil {
            instance = QuestionService()
        }
        return instance!
    }
    
    func getRandomQuestion() -> Question {
        let r = Int(arc4random_uniform(UInt32(self.questionTypes.count)))
        let questionType = questionTypes[r]
        
        var question:Question? = nil
        switch questionType {
            case "photo1":
                question = PhotoQuestion()
                break
            case "fact":
                question = FactQuestion()
                break
            case "relationship":
                question = RelationshipQuestion()
                break
            case "timeline":
                question = TimelineQuestion()
                break
            default:
                break
        }
        return question!
    }
}
