# Database Schema Design

## Collection `manga`

``` js
{
    _id: <ObjectId>,
    update_date: <Date>,
    dmk_id: <Number>,
    dmk_id_gen: <String>,
    dmk_id_web: <String>,
    books: [ <Number> ],
    episodes: [ <Number> ],
    info: {
        title: <String>,
        author: <String>,
        description: <String>,
        ended: <Boolean>,
        genre_dir: <String>,
        tags: [ <String> ]
    }
}
```

## Collection `hot`

``` js
{
    _id: <ObjectId>,
    dmk_id: <Number>,
    genre_dir: <String>
}
```

## Collection `user`

``` js
{
    _id: <ObjectId>,
    username: <String>,
    password: <String>,
    register_date: <Date>,
    last_login: <Date>,
    visit_count: <Number>
}
```

## Collection `follow`

``` js
{
    _id: <ObjectId>,
    user_id: <ObjectId>,
    manga_id: <ObjectId>,
    start_date: <Date>,
    current_episode: <Number>,
    update_date: <Date>,
    up_to_date: <Boolean>
}
```
