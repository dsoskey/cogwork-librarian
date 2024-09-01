import React, {
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { Card, normCardList, QueryRunner, SearchError, SearchOptions } from 'mtgql'
import { COGDB_FILTER_PROVIDER } from '../../api/local/db'
import { ResultAsync } from 'neverthrow'
import { ColorBreakdown } from './cubeTags'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { Input } from '../component/input'
import _cloneDeep from 'lodash/cloneDeep'
import { useMultiInputEditor } from '../hooks/useMultiInputEditor'
import _groupBy from 'lodash/groupBy'
import { Dictionary } from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Modal } from '../component/modal'
import { CardResultsLayout } from './cardResults'

export interface CubeSearchTableProps {}

function colorBreakdown(cards: Card[], tag: string) {
    return cards.reduce((acc, card) => {
        let key: string;
        if (card.colors === undefined || card.colors.length === 0) {
            key = "c";
        } else if (card.colors.length > 1) {
            key = "m";
        } else {
            key = card.colors[0].toLowerCase()
        }
        acc[key]++;
        acc.total++;
        return acc
    }, { tag, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 });
}

const QUERIES = [
    "produces>=2 or is:fetchland",
    "otag:card-advantage",
    "otag:life-payment",
    "otag:recursion",
    "otag:removal",
    "otag:creature-removal",
    "otag:draw",
    "otag:tutor",
    "otag:reanimate",
    "otag:ramp",
    "otag:evasion",
    "otag:discard-outlet",
    "otag:sacrifice-outlet",
    "otag:burn",
    "otag:tutor-battlefield",
    "otag:repeatable-token-generator",
    "otag:lifegain",
    "otag:mill",
    "otag:utility-land",
    "otag:planeswalker-removal",
    "otag:creature-type-erratum",
    "otag:boardwipe",
    "otag:counterspell",
    "otag:mana-sink",
    "otag:cantrip",
    "otag:discard",
    "otag:manland",
]

interface ShownQuery {
    query: string
    cards: OrderedCard[]
}
export function CubeSearchTable({}: CubeSearchTableProps) {
    // optimization: make this a range to check rather than flopping all rows on a line split
    const [flop, setFlop] = useState(false);
    const { cards, cube } = useContext(CubeViewModelContext);
    const cardCount = useMemo(() => _groupBy(cards, "oracle_id"),[cards]);


    const [cardsToShow, _setCardsToShow] = useState<ShownQuery>({
        query: "",
        cards: [],
    });
    const setCardsToShow = (p) => {
        _setCardsToShow(p);
        setTimeout(() => {
            topOfResults.current?.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth"
            })
        }, 200)
    }
    useHighlightPrism([cardsToShow])

    const [queries, setQueries] = useLocalStorage(`cube-table-queries-${cube.key}`, QUERIES);
    const setQuery = (index: number, nextQuery: string) => {
        setQueries((prev) => {
            const next = _cloneDeep(prev);
            next[index] = nextQuery;
            return next;
        })
    }

    const searchCards = useMemo(() =>
      QueryRunner.generateSearchFunction(normCardList(cards), COGDB_FILTER_PROVIDER),
      [cards]
    )


    const totalbucket: ColorBreakdown = colorBreakdown(cards ?? [],"_total_");
    const editorContainer = useRef<HTMLElement>(null)
    const topOfResults = useRef<HTMLHeadingElement>(null)

    const onKeyDown = useMultiInputEditor({
        container: editorContainer,
        className: 'search-row-input',
        numInputs: queries.length,
        onEnter(focus, index, splitIndex) {
            const firstHalf = queries[index].substring(0, splitIndex);
            const secondHalf = queries[index].substring(splitIndex);
            setQueries(prev => {
                const next = cloneDeep(prev);
                next.splice(index, 1, firstHalf, secondHalf)
                return next;
            })

            setTimeout(() => {
                focus(index, false, 0);
                setFlop(p=>!p);
            }, 50);
        },
        onBackspace(focus, index) {
            const prevEntry = queries[index - 1];
            setQueries(prev => {
                const next = cloneDeep(prev);
                next.splice(index, 1);
                next[index-1] = next[index-1] + queries[index]
                return next;
            })
            setTimeout(() => {
                focus(index, true, prevEntry.length)
                setFlop(p=>!p);
            }, 50);
        },
        onDelete(_focusEntry, index) {
            setQueries(prev => {
                const next = cloneDeep(prev);
                const nextQuery = prev[index + 1];
                next[index] = queries[index] + nextQuery
                next.splice(index + 1, 1);
                return next;
            })
            setFlop(p=>!p);
            // No focus, we're already on the correct line
        }
    });

    const onCellClick = (colorKey: string) => {
        if (colorKey === "total") {
            setCardsToShow({ query: "all cards", cards });
        } else {
            setCardsToShow({
                query: `c=${colorKey}`,
                cards: cards.filter(it => {
                    const colors = it.colors ?? [];
                    switch (colorKey) {
                        case "c":
                            return colors.length === 0;
                        case "m":
                            return colors.length >=2;
                        default:
                            return colors.length === 1 && colors[0].toLowerCase() === colorKey;
                    }
                })
            });
        }
    }

    return <>
        <table className='cube-search-table'>
            <thead>
            <tr>
                <th>query</th>
                <th>total</th>
                <th className='w'>w</th>
                <th className='u'>u</th>
                <th className='b'>b</th>
                <th className='r'>r</th>
                <th className='g'>g</th>
                <th className='m'>m</th>
                <th className='c'>c</th>
            </tr>
            </thead>
            <tbody ref={editorContainer}>
            <ColorBreakdownRow onCellClick={onCellClick} breakdown={totalbucket}
                               total={totalbucket.total}>total</ColorBreakdownRow>
            {queries.map(((it, i) => (
              <CubeSearchRow
                setCardsToShow={setCardsToShow}
                flop={flop}
                key={i}
                query={it}
                setQuery={(it) => setQuery(i, it)}
                searchCards={searchCards}
                total={totalbucket.total}
                cardCounts={cardCount}
                onKeyDown={onKeyDown(i)}
              />
            )))}
            </tbody>
        </table>
        {cardsToShow.cards.length > 0 && <CardResultsLayout
          cards={() => cardsToShow.cards}
          filterControl={<h3 ref={topOfResults}>
              <code className='language-scryfall-extended-multi'>
                  {cardsToShow.query}
              </code>
            </h3>}
        />}
    </>;
}

interface CubeSearchRowProps {
    query: string
    setQuery: (query: string) => void
    searchCards: (query: string, searchOptions: SearchOptions) => ResultAsync<Card[], SearchError>
    total: number
    onKeyDown: any
    flop: boolean
    cardCounts: Dictionary<OrderedCard[]>
    setCardsToShow: (cards: ShownQuery) => void;
}

function CubeSearchRow({ flop, onKeyDown, query, setQuery, searchCards, total, cardCounts, setCardsToShow }: CubeSearchRowProps) {
    const [result, setResult] = useState<OrderedCard[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<SearchError | undefined>()
    const timeout = useRef<number>()

    const runSearch = async (q) => {
        if (total === 0) return;

        setError(undefined)
        try {
            const searchResult = await searchCards(q, { order: "cmc" });
            searchResult
              .map(it => setResult(it as OrderedCard[]))
              .mapErr(error => {
                  console.error(error);
                  setError(error);

              })
        } catch (error) {
            console.error(error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (colorKey: string) => {
        if (loading) return;

        const cards = colorKey === "total"
          ? { query, cards: result }
          : { query: `${query} c=${colorKey}`, cards: result.filter(it => {
              const colors = it.colors ?? [];
              switch (colorKey) {
                  case "c":
                      return colors.length === 0;
                  case "m":
                      return colors.length >=2;
                  default:
                      return colors.length === 1 && colors[0].toLowerCase() === colorKey;
              }
          })
        };

        setCardsToShow(cards);
    }

    useEffect(() => {
        clearTimeout(timeout.current);
        timeout.current = undefined
        runSearch(query);
    }, [flop, searchCards]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        clearTimeout(timeout.current);
        // @ts-ignore
        timeout.current = setTimeout(() => {
            runSearch(event.target.value);
            timeout.current = undefined;
        }, 1500);
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            clearTimeout(timeout.current);
            runSearch(query);
        }
        onKeyDown(event);
    }

    const buckets: ColorBreakdown = result.reduce((acc, card) => {
        let key: string;
        if (card.colors === undefined || card.colors.length === 0) {
            key = "c";
        } else if (card.colors.length > 1) {
            key = "m";
        } else {
            key = card.colors[0].toLowerCase()
        }
        acc[key]+= cardCounts[card.oracle_id]?.length ?? 1;
        acc.total+= cardCounts[card.oracle_id]?.length ?? 1;
        return acc
    }, { tag: query, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 });

    return <ColorBreakdownRow
      onCellClick={handleCellClick}
      error={error}
      loading={loading}
      breakdown={buckets}
      total={total}
      isSubTotal>
        <Input
          className='search-row-input'
          language='scryfall-extended-multi'
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
    </ColorBreakdownRow>
}

interface ColorBreakdownRowProps {
    loading?: boolean
    breakdown: ColorBreakdown
    total: number
    isSubTotal?: boolean
    children: React.ReactNode
    error?: SearchError
    onCellClick: (colorKey: string) => void;
}
function ColorBreakdownRow({ onCellClick, error, loading, breakdown, total, isSubTotal, children }: ColorBreakdownRowProps) {
    const [open, setOpen] = useState(false);
    useHighlightPrism([breakdown.tag])

    const denominator = total > 0 ? total : 1
    return <tr className={loading ? "loading" : ""}>
        {open && <Modal open={open} title={`${error.type} error`} onClose={() => setOpen(false)} >
            <pre className="language-none"><code>{error.message}</code></pre>
        </Modal>}
        <td className="row center">
            {children}
            {error && <button className="error-indicator" onClick={() => setOpen(true)}
            >⚠️</button>}
        </td>
        <td onClick={() => onCellClick("total")}>{breakdown.total}
            {isSubTotal && <span className="percentage">{" ("}{(breakdown.total / total * 100).toPrecision(2)}%)</span>}
        </td>
        <td onClick={() => onCellClick("w")} className="w">{breakdown.w} <span className="percentage">({(breakdown.w / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("u")} className="u">{breakdown.u} <span className="percentage">({(breakdown.u / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("b")} className="b">{breakdown.b} <span className="percentage">({(breakdown.b / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("r")} className="r">{breakdown.r} <span className="percentage">({(breakdown.r / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("g")} className="g">{breakdown.g} <span className="percentage">({(breakdown.g / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("m")} className="m">{breakdown.m} <span className="percentage">({(breakdown.m / denominator * 100).toPrecision(2)}%)</span></td>
        <td onClick={() => onCellClick("c")} className="c">{breakdown.c} <span className="percentage">({(breakdown.c / denominator * 100).toPrecision(2)}%)</span></td>
    </tr>
}