import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const settings = {timestampsInSnapshots: true};
admin.firestore().settings(settings);


export const changeInfo = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    await admin.firestore().collection('users')
    .doc(uid)
    .update({
      username: data.username,
      phoneNumber: data.phoneNumber,
      bio: data.bio,
      fullName: data.fullName,
      gender: data.gender,
      interests: data.interests,
      image_url: data.image_url
    })

    console.log('success');
  }
});

 /*
  data:
  {
    fields: [filed]
  }
  */
export const getInfo = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    const activeRef = await admin.firestore().collection("users")
                    .doc(uid).get()
    const retData = activeRef.data()
    if (retData != null) {
      console.log(retData)
      let fields: { [index: string]: any; } = {}
      let i
      for (i in data.fields) {
        const name: string = data.fields[i]
        fields[name] = retData[name]
      }
      console.log("success get info")
      return fields
    }
    else {
      console.log("failure get info")
      return null
    }
  }
  console.log("failure get info")
  return null
});

 /*
  get all photos
  */
 export const getPhotos = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    const activeRef = await admin.firestore().collection("users")
                    .doc(uid).collection('postRefs').get()
    if (!activeRef) {
      console.log('failure get postRefs')
      return {photos: []}
    }
    let photos = []
    let doc
    for (doc of activeRef.docs) {
      const photoRef = await admin.firestore().collection("posts")
                    .doc(doc.id).collection('photos').get()
      if (!photoRef) {
        console.log('failure get photos')
        return {photos: []}
      }
      let photo
      for (photo of photoRef.docs) {
        photos.push(photo.data().photo_url)
      }
    }
    return {photos: photos}
  }
  console.log("failure get photos end")
  return {photos: []}
});

/*
  get all photos
*/
export const getOtherPhotos = functions.https.onCall(async (data, context) => {
  const activeRef = await admin.firestore().collection("users")
                  .doc(data.uid).collection('postRefs').get()
  if (!activeRef) {
    console.log('failure get postRefs')
    return {photos: []}
  }
  let photos = []
  let doc
  for (doc of activeRef.docs) {
    const photoRef = await admin.firestore().collection("posts")
                  .doc(doc.id).collection('photos').get()
    if (!photoRef) {
      console.log('failure get photos')
      return {photos: []}
    }
    let photo
    for (photo of photoRef.docs) {
      photos.push(photo.data().photo_url)
    }
  }
  return {photos: photos}

});


/*
 data:
 {
    username: username,
    fields: [filed]
 }
 */
export const searchByUsername = functions.https.onCall(async (data, context) => {
  const ref = await admin.firestore().collection('users')
  .where('username', '==', data.username).get()

  if (!ref || ref.size != 1) { // should only return one doc
    return null
  }

  const uid = ref.docs[0].id

  const activeRef = await admin.firestore().collection("users")
                   .doc(uid).get()
  const retData = activeRef.data()
  if (retData != null) {
    console.log(retData)
    let fields: { [index: string]: any; } = {}
    let i
    for (i in data.fields) {
      const name: string = data.fields[i]
      fields[name] = retData[name]
    }
    fields.uid = activeRef.id
    console.log("success get info")
    console.log(fields)
    return fields
  }
  else {
    console.log("failure get info")
    return null
  }

});

/*
  data:
  {
    urls: [imageurl],
    caption: captioncontent,
    tags: tags
  }
  return None
*/
export const createPost = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    // create a post in posts collection
    const time = admin.firestore.Timestamp.now();

    let ref = await admin.firestore().collection('posts')
    .add({
      uid: uid,
      caption: data.caption,
      timestamp: time
    })

    if (!ref) {
      return
    } 

    const pid = ref.id

    const photosRef = admin.firestore().collection('posts')
    .doc(pid).collection('photos')
    let url
    for (url of data.urls) {
        await photosRef.add({
        photo_url: url
      })
    }
    console.log('success adding photo');

    if (data.tags) {
    const tagsRef = admin.firestore().collection('tags')
    console.log(data.tags)

    let item
    for (item of data.tags) {
      let tagRef = await tagsRef.doc(item).get()
      if (tagRef.exists) {
        await tagsRef.doc(item).update({
          post_ids: admin.firestore.FieldValue.arrayUnion(pid)
        })
      }
      else {
        await tagsRef.doc(item).set({
          tag: item,
          post_ids: admin.firestore.FieldValue.arrayUnion(pid)
        })
      }
    }
    console.log('success adding tags');
  }

      // create a postRef in users collection

    await admin.firestore().collection('users')
      .doc(uid).collection('postRefs')
      .doc(pid).set({})

      console.log('success creating postRefs');
  }
});


/*
  data:
  { followee_uid: follow this user }
*/
export const followUser = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    await admin.firestore().collection('users')
    .doc(uid)
    .collection('followees')
    .doc(data.followee_uid)
    .set({})

    console.log("add followee")

    await admin.firestore().collection('users')
    .doc(data.followee_uid)
    .collection('followers')
    .doc(uid)
    .set({})
    console.log("add follower")
  }
});

/*
  data:
  { followee_uid: unfollow this username }
*/
export const unfollowUser = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid

    await admin.firestore().collection('users')
    .doc(uid)
    .collection('followees')
    .doc(data.followee_uid)
    .delete()
    console.log("delete followee")


    await admin.firestore().collection('users')
    .doc(data.followee_uid)
    .collection('followers')
    .doc(uid)
    .delete()
    console.log("delete follower")

  }
});

export const followTag = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    await admin.firestore().collection('users')
    .doc(uid)
    .collection('tagFollows')
    .doc(data.tag)
    .set({tag: data.tag})
  }
});

export const unfollowTag = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    await admin.firestore().collection('users')
    .doc(uid)
    .collection('tagFollows')
    .doc(data.tag)
    .delete()
  }
});

export const checkTagFollow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return {follow: false}
  }
  const uid = context.auth.uid
  let ref = await admin.firestore().collection('users')
  .doc(uid)
  .collection('tagFollows')
  .where('tag', '==', data.tag).get()
  if (!ref.empty) {
    console.log('followed')
    return {follow: true}
  }
  console.log('not followed')
  return {follow: false}
});



/*
  data:
  { name: count what file }
*/
export const countDocs = functions.https.onCall(async (data, context) => {
  if (context.auth != null) {
    const uid = context.auth.uid
    let activeRef = await admin.firestore().collection("users")
                          .doc(uid).collection(data.name).get()

    if (!activeRef) {
      console.log('counting fail');
      return {count: 0}
    }
    const size = activeRef.size
    console.log('counting success' + data.name);
    console.log(size);
    return {count: size}

  }
  return {count: 0}
});


/*
  data:
  { username: username,
  name: count what file }
*/
export const countDocsByUsername = functions.https.onCall(async (data, context) => {
  const ref = await admin.firestore().collection('users')
  .where('username', '==', data.username).get()

  if (!ref || ref.size != 1) { // should only return one doc
    return null
  }

  const uid = ref.docs[0].id
  let activeRef = await admin.firestore().collection("users")
                        .doc(uid).collection(data.name).get()

  if (!activeRef) {
    console.log('counting fail');
    return {count: 0}
  }
  const size = activeRef.size
  console.log('counting success' + data.name);
  console.log(size);
  return {count: size}
});

/*
  data:
  { followee_uid: uid }
*/
export const checkfollowee = functions.https.onCall(async (data, context) => {
  if (context.auth) {

    const uid = context.auth.uid
    let activeRef = await admin.firestore().collection("users")
                  .doc(uid).collection("followees").doc(data.followee_uid).get()

    if (activeRef.exists) {
      return {follow: true}
    }
    
    console.log('not followed');
    return {follow: false}
  }
  return {follow: false}

});

/*
  data: {search: search string}
  return: {usernames: [username]}
  */
 export const usernameSearch = functions.https.onCall(async (data, context)=>{
  if (!context.auth) {
    return {usernames: []}
  }
  let activeRef = await admin.firestore().collection("users")
                        .where('username', '>=', data.search)
                        .where('username', '<', (data.search + '{'))
                        .orderBy('username', 'asc').get()

  if (!activeRef) {
    console.log('fail search');
    return {usernames: []}
  }

  const docs = activeRef.docs
  let list:any = []
  let doc
  for (doc of docs) {
    if (doc.id != context.auth.uid) {
      console.log(doc.data())
      list.push(doc.data())
    }
  }
  console.log(list);
  return {usernames: list}
});


/*
  data: {search: search string}
  return: tags: [tag]}
  */
 export const tagSearch = functions.https.onCall(async (data, context)=>{
  if (!context.auth) {
    return {tags: []}
  }
  let activeRef = await admin.firestore().collection("tags")
                        .where('tag', '>=', data.search)
                        .where('tag', '<', (data.search + '{'))
                        .orderBy('tag', 'asc').get()

  if (!activeRef) {
    console.log('fail search');
    return {tags: []}
  }

  const docs = activeRef.docs
  let list:any = {}
  let doc
  for (doc of docs) {
    let tag: string = doc.data().tag
    let count = doc.data().post_ids.length
      list[tag] =  count
  }
  console.log(list);
  return {tags: list}
});


/*
  data: {field: followers/followees}
  return: {usernames: [username]}
  */
 export const generateFollowList = functions.https.onCall(async (data, context)=>{
  if (!context.auth) {
    return {username: []}
  }
  let activeRef = await admin.firestore().collection("users")
                        .doc(context.auth.uid).collection(data.field).get()

  if (!activeRef) {
    console.log('fail search');
    return {usernames: []}
  }

  const docs = activeRef.docs
  let list = []
  let doc
  for (doc of docs) {
    let ref = await admin.firestore().collection('users').doc(doc.id).get()
    if (ref) {
			const temp = ref.data()
      if (temp) {
				temp.uid = ref.id
        list.push(temp)
      }
    }
    
  }
  console.log('success');
  return {usernames: list}

});

/*
  return: {usernames: [username]}
  */
 export const generateMessageList = functions.https.onCall(async (data, context)=>{
  if (!context.auth) {
    return {username: []}
  }
  const followerRef = await admin.firestore().collection("users")
												.doc(context.auth.uid).collection('followers').get()
	const followingRef = await admin.firestore().collection("users")
                        .doc(context.auth.uid).collection('followees').get()

  if (!followerRef || !followerRef) {
    console.log('no people to message');
    return {usernames: []}
  }

  const docs = followerRef.docs
	let list = []
	let followings = []
	let doc
	for (doc of docs) {
		followings.push(doc.id)
  }
  for (doc of followingRef.docs) {
		if (followings.indexOf(doc.id) >= 0) {
			const ref = await admin.firestore().collection('users').doc(doc.id).get()
			if (ref) {
				const temp = ref.data()
				if (temp) {
					temp.uid = ref.id
					list.push(temp)
				}
			}
		}
  }
  console.log('success');
  return {usernames: list}

});


function findId(postList: any, post_id: string) {
  let item
  for (item of postList) {
    const list:[string] = item.post_ids
    if (list.indexOf(post_id) >= 0) {
      return item.tag
    }
  }
  return null
}

export const getFeedList = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    console.log('fail feed');
    return {feeds: []}

  }
  const activeRef = await admin.firestore().collection("posts")
                        .orderBy("timestamp", "desc")
                        .limit(30).get();
  if (!activeRef) {
    console.log('fail feed');
    return {feeds: []}
  }

  const allList = activeRef.docs

  const ref = await admin.firestore().collection("users")
  .doc(context.auth.uid).collection('followees').get();

  if (!ref) {
    console.log('fail feed');
    return {feeds: []}
  }

  let followees = []
  for (let followee of ref.docs) {
    followees.push(followee.id)
  }

  let post_ids = []

  /* get posts from tag followed */
  const tagPostRef = await admin.firestore().collection('users').doc(context.auth.uid).collection('tagFollows').get()
  if (!tagPostRef.empty) {
    let doc
    for (doc of tagPostRef.docs) {
      const postIdRef = await admin.firestore().collection('tags').doc(doc.id).get()
      if (postIdRef) {
        const tagData = postIdRef.data()
        if (tagData) {
          post_ids.push(tagData)
          
        }
      }
    }  
    console.log(post_ids)
  } else {
    post_ids = []
  }


  let feeds = []
  let post
  for (post of allList) {
    const post_uid :string = post.data().uid
    let tag = findId(post_ids, post.id)
    let follow = false
    let index = followees.indexOf(post_uid)
    if (index >= 0 || (tag && post_uid != context.auth.uid)) {
      if (index >= 0) {
        follow = true
      }
      const photoRef = await admin.firestore().collection("posts")
      .doc(post.id).collection('photos').get()

      if (!photoRef) {
        console.log('fail feed');
        return {feeds: []}
      }

      let urls = []
      let item
      for (item of photoRef.docs) {
        urls.push(item.data().photo_url)
      }

      const tagRef = await admin.firestore().collection("tags")
                    .where('post_ids', 'array-contains', post.id).get()

      let tags = []

      if (tagRef) {
        for (item of tagRef.docs) {
          let itemData = item.data()
          tags.push(itemData.tag)
        }
      }

      const commentRef = await admin.firestore().collection("posts")
      .doc(post.id).collection('comments').orderBy('timestamp', 'asc').get()

      let comments = []

      if (commentRef) {
        for (item of commentRef.docs) {
          let itemData = item.data()
          itemData.comment_id = item.id
          comments.push(itemData)
        }
      }

      const likesRef = await admin.firestore().collection("posts")
      .doc(post.id).collection('likes').get()

      let count = 0
      if (likesRef) {
        count = likesRef.size
      }


      const likeRef = await admin.firestore().collection("posts")
      .doc(post.id).collection('likes').doc(context.auth.uid).get()

      const liked = likeRef.exists

      const nameRef = await admin.firestore().collection("users")
      .doc(post_uid).get()

      let username, image_url
      let temp
      if (nameRef.exists) {
        if (nameRef.data() != undefined  ) {
          temp = nameRef.data()
          if (temp != null) {
            username = temp.username
            image_url = temp.image_url
          }
        }
      }

      const feed = post.data()
      feed['follow'] = follow
      feed['tag'] = tag
      feed['username'] = username
      feed['image_url'] = image_url
      feed['urls'] = urls
      feed['tags'] = tags
      feed['comments'] = comments
      feed['post_id'] = post.id
      feed['like_count'] = count
      feed['liked'] = liked
      feeds.push(feed)
      console.log(feed)
    }
  }

  return {feeds: feeds}

});

export const getMyFeedList = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    console.log('fail feed');
    return {feeds: []}

  }

  let uid

  if (data.uid) {
    uid = data.uid
  } else {
    uid = context.auth.uid
  }

  const activeRef = await admin.firestore().collection("posts")
  .where('uid', '==', uid)
  .orderBy("timestamp", "desc").get()
  if (!activeRef) {
    console.log('fail feed');
    return {feeds: [{text: 'query fail'}]}
  }

  const allList = activeRef.docs

  let feeds = []
  let post
  for (post of allList) {
    const photoRef = await admin.firestore().collection("posts")
    .doc(post.id).collection('photos').get()

    if (!photoRef) {
      console.log('fail feed');
      return {feeds: [{text: 'photo fail'}]}
    }

    let urls = []
    let item
    for (item of photoRef.docs) {
      urls.push(item.data().photo_url)
    }

    const tagRef = await admin.firestore().collection("tags")
    .where('post_ids', 'array-contains', post.id).get()

    let tags = []

    if (tagRef) {
      for (item of tagRef.docs) {
        let itemData = item.data()
        tags.push(itemData.tag)
      }
    }

    const commentRef = await admin.firestore().collection("posts")
    .doc(post.id).collection('comments').orderBy('timestamp', 'asc').get()

    let comments = []

    if (commentRef) {
      for (item of commentRef.docs) {
        let itemData = item.data()
        itemData.comment_id = item.id
        comments.push(itemData)
      }
    }

    const likesRef = await admin.firestore().collection("posts")
      .doc(post.id).collection('likes').get()

    let count = 0
    if (likesRef) {
      count = likesRef.size
    }


    const likeRef = await admin.firestore().collection("posts")
    .doc(post.id).collection('likes').doc(uid).get()

    const liked = likeRef.exists

    const feed = post.data()
    feed['urls'] = urls
    feed['comments'] = comments
    feed['tags'] = tags
    feed['post_id'] = post.id
    feed['like_count'] = count
    feed['liked'] = liked
    feeds.push(feed)
    console.log(feed)
  }
  return {feeds: feeds}

});

/* {
  data: {tag: tagname}
} */
export const getTagFeedList = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    console.log('fail feed');
    return {feeds: []}

  }
  const uid = context.auth.uid

  const activeRef = await admin.firestore().collection("tags").doc(data.tag).get()

  if (!activeRef) {
    console.log('fail feed');
    return {feeds: []}
  }

  const allData = activeRef.data()
  let postList
  if (!allData) {
    return {feeds: []}
  }
  
  postList = allData.post_ids.reverse()



  let feeds = []
  let post_id
  for (post_id of postList) {
    const postRef = await admin.firestore().collection('posts').doc(post_id).get()
    if (!postRef || !postRef.data()) {
      return {feeds: []}
    }

    const post = postRef

    const photoRef = await admin.firestore().collection("posts")
    .doc(post_id).collection('photos').get()

    if (!photoRef) {
      console.log('fail feed');
      return {feeds: [{text: 'photo fail'}]}
    }

    let urls = []
    let item
    for (item of photoRef.docs) {
      urls.push(item.data().photo_url)
    }

    const tagRef = await admin.firestore().collection("tags")
    .where('post_ids', 'array-contains', post_id).get()

    let tags = []

    if (tagRef) {
      for (item of tagRef.docs) {
        let itemData = item.data()
        tags.push(itemData.tag)
      }
    }

    const commentRef = await admin.firestore().collection("posts")
    .doc(post_id).collection('comments').orderBy('timestamp', 'asc').get()

    let comments = []

    if (commentRef) {
      for (item of commentRef.docs) {
        let itemData = item.data()
        itemData.comment_id = item.id
        comments.push(itemData)
      }
    }

    const likesRef = await admin.firestore().collection("posts")
      .doc(post_id).collection('likes').get()

    let count = 0
    if (likesRef) {
      count = likesRef.size
    }


    const likeRef = await admin.firestore().collection("posts")
    .doc(post_id).collection('likes').doc(uid).get()

    const liked = likeRef.exists


    let postData = post.data()
    let post_uid
    if (postData) {
      post_uid = postData.uid
    }

    const nameRef = await admin.firestore().collection("users")
    .doc(post_uid).get()

    let username, image_url
    let temp
    if (nameRef.exists) {
      if (nameRef.data() != undefined  ) {
        temp = nameRef.data()
        if (temp != null) {
          username = temp.username
          image_url = temp.image_url
        }
      }
    }

    let feed:any
    feed = post.data()
    if (feed) {
    feed['username'] = username
    feed['image_url'] = image_url
    feed['urls'] = urls
    feed['comments'] = comments
    feed['tags'] = tags
    feed['post_id'] = post.id
    feed['like_count'] = count
    feed['liked'] = liked
    feeds.push(feed)
    console.log(feed)
    }
  }
  return {feeds: feeds}

});

export const countTagPost = functions.https.onCall(async(data, context) => {
  const tagRef = await admin.firestore().collection('tags').doc(data.tag).get()
  if (!tagRef) {
    return {count: 0}
  }
  const tagData = tagRef.data()
  if (!tagData)
    return {count: 0}

  return {count: tagData.post_ids.length}
  
});

/* 
  data: {
    post_id: post's id,
    comment: content,
    username: username
  }
*/
export const addComment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return
  }

  const time = admin.firestore.Timestamp.now();

  let ref = await admin.firestore().collection("posts")
  .doc(data.post_id)
  .collection("comments")
  .add({
    content: data.comment,
    uid: context.auth.uid,
    username: data.username,
    timestamp: time
  })

  if (!ref) {
    console.log('fail adding comments')
    return null
  }
  
  console.log("succress adding comment")
  return {comment: {
    content: data.comment,
    uid: context.auth.uid,
    username: data.username,
    timestamp: time
  }}
});

export const changeCaption = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return
  }

  let ref = await admin.firestore().collection("posts")
  .doc(data.post_id)
  .update({
    caption: data.caption,
  })

  if (!ref) {
    console.log('fail adding comments')
    return
  }
  
  console.log("succress adding comment")
  return
});


/* 
  data: {
    post_id: post's id
  }
*/
export const addLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return
  }
  const time = admin.firestore.Timestamp.now();

  const ref = await admin.firestore().collection("posts")
  .doc(data.post_id)
  .collection("likes")
  .doc(context.auth.uid)
  .set({timestamp: time})

  if (!ref) {
    console.log('fail adding like')
    return
  }
  
  console.log("succress adding like")
    
});


/* 
  data: {
    post_id: post's id
  }
*/
export const deleteLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return
  }

  let ref = await admin.firestore().collection("posts")
  .doc(data.post_id)
  .collection("likes")
  .doc(context.auth.uid)
  .delete()

  if (!ref) {
    console.log('fail delete like')
    return
  }
  
  console.log("succress delete like")
    
});

function sortByKey(array: any, key: string) {
  return array.sort(function(a: any, b: any) {
      let x = a[key]; let y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

export const getLikes = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    return null
  }
  let list = []
  let ref = await admin.firestore().collection('posts').where('uid', '==', context.auth.uid).get();
  if (ref.empty) {
    return {list: []}
  }
  let doc
  for (doc of ref.docs) {
    let likeRef = await admin.firestore().collection('posts').doc(doc.id).collection('likes').get()
    if (!likeRef.empty) {
      let likeData
      for (likeData of likeRef.docs) {
        let like_uid = likeData.id
        let usernameRef = await admin.firestore().collection('users').doc(like_uid).get()
        if (usernameRef.exists) {
          const temp = likeData.data()
          const userData = usernameRef.data()
          if (userData) {
            temp.username = userData.username
            temp.image_url = userData.image_url
            list.push(temp)
          }
        }
      }
    }
  }

  list = sortByKey(list, 'timestamp')
  return {list: list}
});

/* 
  data: {
    post_id: post's id,
    comment_id
  }
*/
export const addCommentLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return
  }

  let ref = await admin.firestore().collection("posts")
  .doc(data.post_id)
  .collection("comments")
  .doc(data.comment_id)
  .collection("likes")
  .doc(context.auth.uid)
  .set({})

  if (!ref) {
    console.log('fail adding like')
    return
  }
  
  console.log("succress adding like")
    
});

export const newFollower = functions.firestore
    .document('users/{userId}/followers/{followerId}')
    .onCreate(async (snap, context) => {
      // followerId follows userId
      console.log(context.params.userId)
      console.log(context.params.followerId)
    // access data necessary for push notification 
    const sender = context.params.followerId;
    const recipient = context.params.userId;
    // the payload is what will be delivered to the device(s)
    let message
    const senderRef = await admin.firestore().collection("users").doc(sender).get()
    const senderData = senderRef.data()
    if (senderData) {
      message = senderData.username + ' started following you'
    }
     // or collect them by accessing your database
    let payload = {
      notification: {
        body: message,
        sound: "default"
      }
    }
    let pushToken = ""
    const ref = await admin.firestore().collection("users").doc(recipient).get()
    const docData = ref.data()
    if (docData) {
      pushToken = docData.pushToken;
      return admin.messaging().sendToDevice(pushToken, payload);    
    }
    return null
});

export const newLike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onCreate(async (snap, context) => {
      // followerId follows userId
      console.log(context.params.userId)
      console.log(context.params.postId)
    // access data necessary for push notification 
    const sender = context.params.userId;
    let recipient = ''
    const recipientRef = await admin.firestore().collection("posts").doc(context.params.postId).get()
    const recipientData = recipientRef.data()
    if (recipientData) {
      recipient = recipientData.uid
    }

    let message
    const senderRef = await admin.firestore().collection("users").doc(sender).get()
    const senderData = senderRef.data()
    if (senderData) {
      message = senderData.username + ' liked your post'
    }
     // or collect them by accessing your database
    let payload = {
      notification: {
        body: message,
        sound: "default"
      }
    }
    let pushToken = ""
    const ref = await admin.firestore().collection("users").doc(recipient).get()
    const docData = ref.data()
    if (docData) {
      pushToken = docData.pushToken;
      return admin.messaging().sendToDevice(pushToken, payload);    
    }
    return null
});

export const newComment = functions.firestore
    .document('posts/{postId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
    // access data necessary for push notification 
    let sender = ''
    
    const senderIdData = snap.data()
    if (senderIdData) {
      sender = senderIdData.uid
    }

    console.log('sender: ' + sender)

    let recipient = ''
    const recipientRef = await admin.firestore().collection("posts").doc(context.params.postId).get()
    const recipientData = recipientRef.data()
    if (recipientData) {
      recipient = recipientData.uid
    }

    console.log('recipient: ' + recipient)

    let message
    const senderRef = await admin.firestore().collection("users").doc(sender).get()
    const senderData = senderRef.data()
    if (senderData) {
      message = senderData.username + ' commented your post'
    }

    console.log('message: ' + message)


    let payload = {
      notification: {
        body: message,
        sound: "default"
      }
    }
    let pushToken = ""
    const ref = await admin.firestore().collection("users").doc(recipient).get()
    const docData = ref.data()
    if (docData) {
      pushToken = docData.pushToken;
      return admin.messaging().sendToDevice(pushToken, payload);    
    }
    return null
});
/*
 data: {
	_id: message_id,
	receiver_uid: uid,
  text: 'Hello developer',
  createdAt: new Date(),
  user: { //sender
    _id: uid,
    name: 'React Native',
    avatar: image_url,
  },
 },
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		return
	}
	const time = admin.firestore.Timestamp.now();
	const receiver_uid = data.receiver_uid;
	const uid = data.user._id;
	let chatroomId = ''
	if (uid > receiver_uid) {
		chatroomId = uid + receiver_uid;
	} else {
		chatroomId = receiver_uid + uid;
	}
	await admin.firestore().collection('chatrooms/' + chatroomId + '/messages')
	.add({
		timestamp: time,
		text: data.text,
		sender: uid,
		receiver: receiver_uid
	})
});


export const newMessage = functions.firestore
.document('chatrooms/{chatroomId}/messages/{messageId}')
.onCreate(async (snap, context) => {
	// notify receiver in message object
	console.log(context.params.chatroomId)
	console.log(context.params.messageId)

	// access data necessary for push notification 
	let recipient = ''
	let sender = ''
	let message = ''

	const snapData = snap.data()
	if (snapData) {
		recipient = snapData.receiver
		sender = snapData.sender
		message = snapData.text
	}

	let title
	const senderRef = await admin.firestore().collection("users").doc(sender).get()
	const senderData = senderRef.data()
	if (senderData) {
		title = senderData.username
	}

	const payload = {
		notification: {
			title: title,
      body: message,
      sound: "default"
		}
	}
	let pushToken = ""
	const ref = await admin.firestore().collection("users").doc(recipient).get()
	const docData = ref.data()
	if (docData) {
		pushToken = docData.pushToken;
		return admin.messaging().sendToDevice(pushToken, payload);    
	}
	return null
})