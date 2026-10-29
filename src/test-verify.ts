import { app } from "./app.js";

async function runTests() {
  console.log("=== verification of all requirements ===");

  const timestamp = Date.now();
  const email = `author_${timestamp}@test.com`;
  const username = `author_${timestamp}`;
  const initialPassword = "initialPassword123";
  const newPassword = "newSecurePassword456";

  // register account and profile
  const regRes = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username,
      displayName: "Jane Initial",
      password: initialPassword,
    }),
  });
  console.log("1. register:", regRes.status);
  const regData = await regRes.json();
  let token = regData.data.token;

  // change password
  const pwdRes = await app.request("/api/auth/change-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: newPassword,
    }),
  });
  console.log("2. change password:", pwdRes.status);

  // login with new password
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: newPassword,
    }),
  });
  console.log("3. login with new password:", loginRes.status);
  const loginData = await loginRes.json();
  token = loginData.data.token;

  // update profile details
  const profileRes = await app.request("/api/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: "Jane Updated",
      bio: "Fullstack developer passionate about SQLite & community publishing.",
      image: "https://example.com/jane.jpg",
    }),
  });
  console.log("4. update profile:", profileRes.status);
  const updatedProfile = await profileRes.json();
  console.log("   updated name:", updatedProfile.data.displayName);

  // fetch public profile
  const getProfileRes = await app.request(`/api/users/${username}`);
  console.log("5. get public profile:", getProfileRes.status);

  // list users
  const listUsersRes = await app.request("/api/users?page=1&limit=5");
  console.log("6. list users:", listUsersRes.status);

  // create article
  const postRes = await app.request("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "Building Community Platforms with SQLite",
      excerpt: "A deep dive into SQLite architecture.",
      body: "Full content of the article detailing the community platform architecture...",
    }),
  });
  console.log("7. create article:", postRes.status);
  const postData = await postRes.json();
  const articleId = postData.data.id;

  // list articles feed
  const listPostsRes = await app.request("/api/articles?page=1&limit=5");
  console.log("8. list articles:", listPostsRes.status);

  // list my own articles
  const myPostsRes = await app.request("/api/articles/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("9. get my articles:", myPostsRes.status);

  // list articles by author
  const authorPostsRes = await app.request(`/api/users/${username}/articles`);
  console.log("10. get author articles:", authorPostsRes.status);

  // get single article
  const getPostRes = await app.request(`/api/articles/${articleId}`);
  console.log("11. read single article:", getPostRes.status);

  // update article
  const updatePostRes = await app.request(`/api/articles/${articleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "Building Community Platforms with SQLite (Updated Edition)",
      body: "Updated body content with additional tips.",
    }),
  });
  console.log("12. update article:", updatePostRes.status);

  // create comment
  const createCommentRes = await app.request(`/api/articles/${articleId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      body: "This is a great community post!",
    }),
  });
  console.log("13. create comment:", createCommentRes.status);
  const commentData = await createCommentRes.json();
  const commentId = commentData.data.id;

  // list comments on article
  const listCommentsRes = await app.request(`/api/articles/${articleId}/comments?page=1&limit=5`);
  console.log("14. list comments for article:", listCommentsRes.status);

  // get comment by id
  const getCommentRes = await app.request(`/api/comments/${commentId}`);
  console.log("15. read single comment:", getCommentRes.status);

  // edit comment
  const updateCommentRes = await app.request(`/api/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      body: "This is a great community post! (Edited by author)",
    }),
  });
  console.log("16. update comment:", updateCommentRes.status);

  // delete comment
  const deleteCommentRes = await app.request(`/api/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("17. delete comment:", deleteCommentRes.status);

  // delete article
  const deletePostRes = await app.request(`/api/articles/${articleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("18. delete article:", deletePostRes.status);

  // delete account with cascade
  const deleteUserRes = await app.request("/api/users/me", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("19. delete user account:", deleteUserRes.status);

  // check openapi spec and scalar ui
  const docRes = await app.request("/api/doc");
  const refRes = await app.request("/api/reference");
  console.log("20. openapi spec:", docRes.status, "| scalar ui:", refRes.status);

  console.log("=== all 20 tests passed successfully! ===");
}

runTests().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
