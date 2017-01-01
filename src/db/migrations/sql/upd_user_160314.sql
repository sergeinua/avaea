SET search_path TO public;

UPDATE "user" SET is_whitelist =1
WHERE email IN(
    'constfilin@gmail.com',
    'v.mustafin@gmail.com',
    'eugene.tokarev@gmail.com',
    'igor.markov1@gmail.com',
    'scottinsfbay@gmail.com',
    'olmiha@gmail.com',
    'germiy@gmail.com',
    'manoj.mystifly@gmail.com',
    'igorya.inscriptio@gmail.com',
    'valentine.kaminskiy@gmail.com',
    'wkspilman@gmail.com'
    )
    OR
    (email ~ '[^@]+?@avaea\.com');
;