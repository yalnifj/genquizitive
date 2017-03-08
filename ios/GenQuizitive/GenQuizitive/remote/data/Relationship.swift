import Foundation

class Relationship : Subject {
    static var REL_TYPE_COUPLE = "http://gedcomx.org/Couple"
    static var REL_TYPE_PARENTCHILD = "http://gedcomx.org/ParentChild"
    
	var type:String?
	var person1:ResourceReference?
	var person2:ResourceReference?
	var facts = [Fact]()
	var fields = [Field]()
	
	static func convertJsonToRelationships(_ json:JSON) -> [Relationship] {
		var relationships = [Relationship]()
		
        if json["relationships"] != JSON.null {
            for rson:JSON in json["relationships"].array! {
                let rel = Relationship()
                rel.id = rson["id"].description
                rel.addLinksFromJson(rson)
                rel.type = rson["type"].description
                rel.person1 = ResourceReference.convertJsonToResourceReference(rson["person1"])
                rel.person2 = ResourceReference.convertJsonToResourceReference(rson["person2"])
                rel.addIdentifiersFromJson(rson)
                relationships.append(rel)
            }
        }
		
        return relationships;
    }
}
