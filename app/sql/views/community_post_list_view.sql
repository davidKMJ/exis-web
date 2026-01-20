-- CREATE OR REPLACE VIEW community_post_list_view AS
-- SELECT
--     posts.post_id,
--     posts.title,
--     posts.content,
--     posts.created_at,
--     posts.topic_id,
--     posts.profile_id,
--     topics.name as topic_name,
--     topics.slug as topic_slug,
--     profiles.name as author_name,
--     profiles.avatar as author_avatar,
--     COUNT(post_upvotes.post_id) as upvotes
-- FROM posts
-- INNER JOIN topics USING (topic_id)
-- INNER JOIN profiles USING (profile_id)
-- LEFT JOIN post_upvotes USING (post_id)
-- GROUP BY posts.post_id, topics.topic_id, profiles.profile_id
-- ORDER BY posts.created_at DESC;

-- SELECT * FROM community_post_list_view;

CREATE OR REPLACE VIEW community_post_list_view AS
SELECT
    posts.post_id,
    posts.title,
    posts.content,
    posts.created_at,
    posts.topic_id,
    posts.profile_id,
    topics.name as topic_name,
    topics.slug as topic_slug,
    profiles.name as author_name,
    profiles.avatar as author_avatar,
    posts.upvotes,
    (SELECT EXISTS (SELECT 1 FROM public.post_upvotes WHERE post_upvotes.post_id = posts.post_id AND post_upvotes.profile_id = auth.uid())) AS is_upvoted
FROM posts
INNER JOIN topics USING (topic_id)
INNER JOIN profiles USING (profile_id);

SELECT * FROM community_post_list_view;