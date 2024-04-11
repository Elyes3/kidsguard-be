const { initializeAdminApp } = require('../firebase')
const admin = initializeAdminApp();
const _auth = admin.auth();
const _database = admin.database();
const reference = _database.ref('users');
const doesParentExist = async email => {
    console.log(email);
    const snapshot = await reference
        .child('parents')
        .orderByChild('email')
        .equalTo(email.trim())
        .once('value');
    let parentId = null;
    snapshot.forEach(item => {
        parentId = item.key;
    })
    console.log(parentId);
    return parentId;
}

exports.parentSignUp = async (req, res) => {
    console.log(req.body);
    const { email, password, firstName, lastName } = req.body;
    console.log(email, password, firstName, lastName);
    if (email && password && firstName && lastName) {
        try {
            const { uid } = await _auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
            })
            const customClaims = {
                isParent: true
            };
            await _auth.setCustomUserClaims(uid, customClaims);
            reference.child(`/parents/${uid}`).set({
                email,
                firstName,
                lastName,
            })
        }
        catch (error) {
            return res.status(400).json({message: error.message}) 
        }
        return res.status(201).json({
            message : 'Account created sucessfully !'
        })
    }
    else
    {    
        return res.status(400).json({
        message : 'Please fill the empty fields !'})
    }
}

exports.childSignUp = async (req, res) => {
    const { email, password, parentEmail, firstName, lastName } = req.body;

    if (email && password && parentEmail && firstName && lastName) {
        const parentId = await doesParentExist(parentEmail);
        if (!parentId) {
            return res.status(404).json({
                message: 'This parent does not exist !'
            })
        }
        else {
            try {
                const { uid } = await _auth.createUser({
                    email,
                    password,
                    displayName: `${firstName} ${lastName}`,
                })
        

            const customClaims = {
                isParent: false
            };
            await _auth.setCustomUserClaims(uid, customClaims);
            reference.child(`/children/${uid}`).set({
                email,
                firstName,
                lastName,
                parentId
            })
            await reference.child('parents').child(parentId).once('value', snapshot => {
                let parentData = snapshot.val();
                let childrenIds;
                if (parentData) {
                    console.log(parentData);
                    childrenIds = parentData.childrenIds;
                    if (childrenIds)
                    {
                        console.log("IN IF");
                        const numberOfChildren = Object.keys(childrenIds).length;
                        childrenIds[numberOfChildren] = uid
                    }
                    else
                    {
                        console.log(parentData.email);
                        childrenIds = { 0: uid };
                        console.log(parentData);
                    }
                    parentData.childrenIds = childrenIds;
                    reference.child('parents').child(parentId).set(parentData);
                    }
                    else
                    {
                        return res.status(404).json({
                            message: 'Could not bind child to parent !'
                        })
                    }
            })
            }

            catch (error){
                return res.status(400).json({
                    message: error.message
                })
            };
            return res.status(201).json({
                message: 'Account created successfully !'
            })
        }
    }
    else 
        return res.status(400).json({
        message : 'Please fill the empty fields !'})
}