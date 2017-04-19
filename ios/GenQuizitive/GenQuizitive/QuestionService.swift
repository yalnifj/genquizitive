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
    var person:Person?
    var myTime:TimeInterval?
    var friendTime:TimeInterval?
    var myIncorrectCount:Int = 0
    var friendIncorrectCount:Int = 0
    
    var questionText:String!
    
    func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?)->Void) {
        onCompletion(self, NSError(domain: "Question", code: 1, userInfo: ["message":"Setup method must be overridden in a subclass"]))
    }
    
    func setupFromPersistenceMap(map:[String:Any?]) {
        difficulty = map["difficulty"] as! Int
        let personMap = map["person"] as? [String:Any?]
        if personMap != nil {
            person = Person()
            person?.id = personMap!["id"] as? String
            let displayMap = personMap!["display"] as? [String:Any?]
            if displayMap != nil {
                person?.display = DisplayProperties()
                person?.display?.name = displayMap!["name"] as? String
                person?.display?.ascendancyNumber = displayMap!["ascendancyNumber"] as? String
            }
            myTime = map["myTime"] as? TimeInterval
            friendTime = map["friendTime"] as? TimeInterval
            myIncorrectCount = map["myIncorrectCount"] as! Int
            friendIncorrectCount = map["friendIncorrectCount"] as! Int
            questionText = map["questionText"] as! String
            
            let familyTreeService = FamilyTreeService.getInstance()
            if familyTreeService.remoteService != nil && familyTreeService.remoteService?.sessionId != nil {
                familyTreeService.getPerson(personId: person!.id, onCompletion: {person, err in
                    if person != nil {
                        self.person = person
                    } else {
                        if personMap!["portrait"] != nil {
                            familyTreeService.portraits[person!.id] = personMap!["portrait"] as? String
                        }
                    }
                })
            }
        }
    }
    
    func getPersistMap() -> [String:Any?] {
        var map = [String:Any?]()
        map["name"] = name
        map["difficulty"] = difficulty
        if person != nil {
            var personMap = [String:Any?]()
            personMap["id"] = person!.id
            var displayMap = [String:Any?]()
            displayMap["name"] = person?.display?.name
            displayMap["ascendancyNumber"] = person?.display?.ascendancyNumber
            personMap["display"] = displayMap
            personMap["portrait"] = FamilyTreeService.getInstance().portraits[person!.id]
            map["person"] = personMap
        }
        map["myTime"] = myTime
        map["friendTime"] = friendTime
        map["myIncorrectCount"] = myIncorrectCount
        map["friendIncorrectCount"] = friendIncorrectCount
        map["questionText"] = questionText
        return map
    }
}

class MultipleChoiceQuestion : Question {
    var answerPeople:[Person]!
    
    override func getPersistMap() -> [String : Any?] {
        var map = super.getPersistMap()
        var answerMap = [[String:Any?]]()
        for person in answerPeople {
            var personMap = [String:Any?]()
            personMap["id"] = person.id
            var displayMap = [String:Any?]()
            displayMap["name"] = person.display?.name
            displayMap["ascendancyNumber"] = person.display?.ascendancyNumber
            personMap["display"] = displayMap
            personMap["portrait"] = FamilyTreeService.getInstance().portraits[person.id]
            answerMap.append(personMap)
        }
        map["answerPeople"] = answerMap
        return map
    }
    
    override func setupFromPersistenceMap(map: [String : Any?]) {
        super.setupFromPersistenceMap(map: map)
        answerPeople = [Person]()
        let answerMap = map["answerPeople"] as! [[String:Any?]]
        for personMap in answerMap {
            let person = Person()
            person.id = personMap["id"] as? String
            let displayMap = personMap["display"] as? [String:Any?]
            if displayMap != nil {
                person.display = DisplayProperties()
                person.display?.name = displayMap!["name"] as? String
                person.display?.ascendancyNumber = displayMap!["ascendancyNumber"] as? String
            }
            answerPeople.append(person)
        }
    }
}

class GenQuizRound {
    var id:String?
    var questions:[Question]
    var myTotalTime:TimeInterval
    var friendTotalTime:TimeInterval
    var myTotalIncorrect:Int = 0
    var friendTotalIncorrect:Int = 0
    
    var toId:String?
    var fromId:String?
    var toViewed = false
    var fromViewed = false
    
    init(questions:[Question]) {
        self.questions = questions
        myTotalTime = 0
        friendTotalTime = 0
        for q in questions {
            if q.myTime != nil {
                myTotalTime += q.myTime!
            }
            if q.friendTime != nil {
                friendTotalTime += q.friendTime!
            }
            myTotalIncorrect += q.myIncorrectCount
            friendTotalIncorrect += q.friendIncorrectCount
            
            myTotalTime += Double(q.myIncorrectCount * 20)
            friendTotalTime += Double(q.friendIncorrectCount * 20)
        }
    }
    
    init(map: [String:Any?]) {
        id = map["id"] as? String
        myTotalTime = map["myTotalTime"] as! TimeInterval
        friendTotalTime = map["friendTotalTime"] as! TimeInterval
        myTotalIncorrect = map["myTotalIncorrect"] as! Int
        friendTotalIncorrect = map["friendTotalIncorrect"] as! Int
        
        toId = map["toId"] as? String
        fromId = map["fromId"] as? String
        toViewed = map["toViewed"] as! Bool
        fromViewed = map["fromViewed"] as! Bool
        
        questions = [Question]()
        let qarray = map["questions"] as! [[String:Any?]]
        for questionMap in qarray {
            let questionName = questionMap["name"] as! String
            var question:Question? = nil
            switch questionName {
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
            case "tree":
                question = TreeQuestion()
                break
            case "connect":
                question = ConnectQuestion()
                break
            default:
                break
            }
            if question != nil {
                question?.setupFromPersistenceMap(map: questionMap)
                questions.append(question!)
            }
        }
    }
    
    func getPersistMap() -> [String:Any?] {
        var map = [String:Any?]()
        map["id"] = id
        map["myTotalTime"] = myTotalTime
        map["friendTotalTime"] = friendTotalTime
        map["myTotalIncorrect"] = myTotalIncorrect
        map["friendTotalIncorrect"] = friendTotalIncorrect
        map["toId"] = toId
        map["fromId"] = fromId
        map["toViewed"] = toViewed
        map["fromViewed"] = fromViewed
        var questionMap = [[String:Any?]]()
        for question in questions {
            questionMap.append(question.getPersistMap())
        }
        map["questions"] = questionMap
        return map
    }
}

class QuestionService {
 
    var questionTypes = ["photo1", "fact", "relationship", "timeline", "tree", "connect"]
    
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
            case "tree":
                question = TreeQuestion()
                break
            case "connect":
                question = ConnectQuestion()
                break
            default:
                break
        }
        return question!
    }
}
