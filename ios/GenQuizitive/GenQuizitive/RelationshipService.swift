//
//  RelationshipService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/4/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class RelationshipService {
    static var instance:RelationshipService?
    static func getInstance() -> RelationshipService {
        if instance == nil {
            instance = RelationshipService()
        }
        return instance!
    }
    private init() {
        
    }
    
    func getRandomRelationshipPath(person:Person, length:Int, useLiving:Bool, onCompletion: @escaping ([String:Any?])->Void) {
        DispatchQueue.global().async {
            var path = [Relationship]()
            var pathPeople = [Person]()
            pathPeople.append(person)
            var currentPerson = person
            var nextPerson:Person? = nil
            var counter = 0
            var personCount = 0
            var lastRand = -1
            let semaphore = DispatchSemaphore(value: 0)
            while (path.count < length || (!useLiving && currentPerson.living)) && counter < length * 5 {
                let lastPath = path.last
                var rand = Int(arc4random_uniform(4))
                if rand > 2 && lastPath?.type == Relationship.REL_TYPE_COUPLE {
                    rand = lastRand
                }
                while rand == lastRand {
                    rand = Int(arc4random_uniform(4))
                    if rand > 2 && lastPath?.type == Relationship.REL_TYPE_COUPLE {
                        rand = lastRand
                    }
                }
                lastRand = rand
                
                nextPerson = nil
                
                //-- give preference to parent paths
                if rand < 2 || (!useLiving && currentPerson.living && personCount==0) {
                    //-- parent path
                    FamilyTreeService.getInstance().getParents(personId: currentPerson.id!, onCompletion: {parents, err in
                        if parents != nil && parents!.count > 0 {
                            let rp = Int(arc4random_uniform(UInt32(parents!.count)))
                            nextPerson = parents![rp]
                            if !pathPeople.contains(where: {person in return person.id == nextPerson!.id}) {
                                let rel = Relationship()
                                rel.person1 = ResourceReference()
                                rel.person1?.resourceId = nextPerson!.id
                                rel.person2 = ResourceReference()
                                rel.person2?.resourceId = currentPerson.id
                                rel.type = Relationship.REL_TYPE_PARENTCHILD
                                path.append(rel)
                            } else {
                                nextPerson = nil
                            }
                        }
                        semaphore.signal()
                    })
                } else if rand == 2 {
                    //-- child path
                    FamilyTreeService.getInstance().getChildren(personId: currentPerson.id!, onCompletion: {children, err in
                        if children != nil && children!.count > 0 {
                            let rp = Int(arc4random_uniform(UInt32(children!.count)))
                            nextPerson = children![rp]
                            if !pathPeople.contains(where: {person in return person.id == nextPerson!.id}) {
                                let rel = Relationship()
                                rel.person1 = ResourceReference()
                                rel.person1?.resourceId = currentPerson.id
                                rel.person2 = ResourceReference()
                                rel.person2?.resourceId = nextPerson!.id
                                rel.type = Relationship.REL_TYPE_PARENTCHILD
                                path.append(rel)
                            } else {
                                nextPerson = nil
                            }
                        }
                        semaphore.signal()
                    })
                } else {
                    //-- spouse path
                    FamilyTreeService.getInstance().getSpouses(personId: currentPerson.id!, onCompletion: {spouses, err in
                        if spouses != nil && spouses!.count > 0 {
                            let rp = Int(arc4random_uniform(UInt32(spouses!.count)))
                            nextPerson = spouses![rp]
                            if !pathPeople.contains(where: {person in return person.id == nextPerson!.id}) {
                                let rel = Relationship()
                                rel.person1 = ResourceReference()
                                rel.person1?.resourceId = currentPerson.id
                                rel.person2 = ResourceReference()
                                rel.person2?.resourceId = nextPerson!.id
                                rel.type = Relationship.REL_TYPE_COUPLE
                                path.append(rel)
                            } else {
                                nextPerson = nil
                            }
                        }
                        semaphore.signal()
                    })
                }
                
                _ = semaphore.wait(timeout: DispatchTime.distantFuture)
                if nextPerson != nil {
                    //-- move up the path
                    currentPerson = nextPerson!
                    pathPeople.append(currentPerson)
                    personCount = 0
                    lastRand = -1
                } else {
                    personCount += 1
                    //-- didn't find a person on that path
                    //-- try 3 times with the same person then pop them off the path
                    if personCount > 3 {
                        if pathPeople.count > 1 {
                            path.removeLast()
                            pathPeople.removeLast()
                        }
                        lastRand = -1
                        personCount = 0
                        currentPerson = pathPeople.last!
                    }
                }
                
                
                counter += 1
            }
            var dict = [String:Any?]()
            dict["path"] = path
            dict["lastPerson"] = currentPerson
            DispatchQueue.main.async(execute: {
                onCompletion(dict)
            })
        }
    }
    
    func verbalizePath(startPerson: Person, path: [Relationship]) -> String {
        var text = ""
        var currentPerson = startPerson
        var p = 0
        let semaphore = DispatchSemaphore(value: 0)
        for rel in path {
            FamilyTreeService.getInstance().getPerson(personId: rel.person1!.resourceId!, onCompletion: {person1, err in
                FamilyTreeService.getInstance().getPerson(personId: rel.person2!.resourceId!, onCompletion: {person2, err in
                    if rel.type == Relationship.REL_TYPE_PARENTCHILD {
                        if person1 == nil {
                            text += "parent"
                        }
                        else if person2 == nil {
                            text += "child"
                        } else {
                            if person1!.id == currentPerson.id {
                                if person2!.gender == GenderType.male {
                                    text += "son"
                                } else {
                                    text += "daughter"
                                }
                                currentPerson = person2!
                            } else {
                                if person1!.gender == GenderType.male {
                                    text += "father"
                                } else {
                                    text += "mother"
                                }
                                currentPerson = person1!
                            }
                        }
                    } else {
                        if person1 == nil || person2 == nil {
                            text += "spouse"
                        } else {
                            if person1!.id == currentPerson.id {
                                if person2!.gender == GenderType.male {
                                    text += "husband"
                                } else {
                                    text += "wife"
                                }
                                currentPerson = person2!
                            } else {
                                if person1!.gender == GenderType.male {
                                    text += "husband"
                                } else {
                                    text += "wife"
                                }
                                currentPerson = person1!
                            }
                        }
                    }
                    semaphore.signal()
                })
                
            })
            
            _ = semaphore.wait(timeout: DispatchTime.distantFuture)
            p += 1
            if p < path.count {
                text += "'s "
            }
            
        }
        return text
    }
}
