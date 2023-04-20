import React, { useState, useEffect, useRef, useCallback } from "react";
import AnimeCard from "components/card";
import { Animetype, PageOptType } from 'utils/constant';
import getDataAnimeList from "graphql/anime/list";
import { useIntersect } from "hooks/useIntersectionObserverHooks";
import List from "components/list";

interface AnimeListProps {
  options?: IntersectionObserverInit;
  isBookmark?: boolean;
}

const AnimeList = (props: AnimeListProps) => {

  const ref = useRef<HTMLDivElement>(null);
  const { setNode, entry } = useIntersect(props.options);
  const [variables, setVariables] = useState({
    page: 1,
    perPage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [pageOpt, setPageOpt] = useState<PageOptType | null>(null);
  const [media, setMedia] = useState<Animetype[] | null | []>(null);

  const handleChange = useCallback(
		() => pageOpt?.hasNextPage && !loading ? setVariables((prev) => ({...prev, page: variables.page + 1})) : null,
		[loading, variables.page, pageOpt?.hasNextPage],
  );
  
  // const clean = (obj: any) => {
  //   for (const propName in obj) {
  //     if (obj[propName] === null || obj[propName] === undefined ||  obj[propName] === "" ||  obj[propName] === false) {
  //       delete obj[propName];
  //     }
  //   }
  //   return obj
  // }

  useEffect(() => {
    if (ref.current) setNode(ref.current);
  }, [setNode]);

  useEffect(() => {
    if (entry?.isIntersecting && !loading) {
        setTimeout(() => {
          handleChange();
        }, 500 );
      }
    }, [entry, props, loading, handleChange]);

  
  useEffect(() => {

    setLoading(true);

    const fetchData = async () => {
      // let vars = { ...variables };
      // if (props.isBookmark) {
      //   vars = {...vars, isFavourite: true};
      // }

      // const varCleaned = clean(vars);

      try {
        const data = await getDataAnimeList(variables);
        const pageData = data && data?.data?.Page;
        const mediaNew = pageData?.media;
        const pageInfo = pageData?.pageInfo;
        if (mediaNew && mediaNew.length > 0) {
          setMedia((prev) => prev !== null ? [...prev, ...mediaNew] : []);
          setPageOpt(pageInfo);
        }

      } catch {

      } finally {
        setLoading(false);
      }
    }

    fetchData();

	}, [variables]);

  const handleViewDetail = useCallback((id: string) => {
    window.location.href = `/anime/${id}`;
  }, [])

  const isFirstFetch = media === undefined || media === null;

  return (
    <>
        {
          media && (
            <List data={media} handleViewDetail={handleViewDetail}/>
          )
        }
      <div className="anime-content">
          {
            loading && isFirstFetch && (
              <div className="anime-shimmer">

              </div>
            )
          }
        </div>
        <div ref={ref} style={{ height: 100 }}/>
      <style jsx>
        {`
          .anime-shimmer {
            min-width: 100vw;
            height: 100vh;
          }
          .anime-content {
            max-width: 1050px;
            margin: 0 auto;
            display: grid;
            gap: 15px;
            grid-template-columns: repeat(5, 1fr);
          }
          .anime-list {
            width: 100%;
            width: 200px;
            display: flex;
          }
          @media (max-width: 1050px) {
            .anime-content { 
              grid-template-columns: repeat(4, 1fr);
            }
          }
          @media (max-width: 840px) {
            .anime-content { 
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 620px) {
            .anime-content { 
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 410px) {
            .anime-content { 
              grid-template-columns: repeat(1, 1fr);
            }
          }
        `}
      </style>
    </>
  );
};

export default AnimeList;
