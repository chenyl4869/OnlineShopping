<template>
  <div class="wrapper">
    <nav-header></nav-header>
    <nav-bread><span>good</span></nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur" @click = 'getGoodsList'>Default</a>
          <a href="javascript:void(0)" class="price" @click = 'sortGoods'>Price 
            <svg class="icon icon-arrow-short" v-bind:class = "{'sort-up':!sortFlag}">
              <use xlink:href="#icon-arrow-short">
              </use>
            </svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click = "showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" v-bind:class = "{'filterby-show':priceFilterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked == 'all'}" @click = "setPriceFilter('all')">All</a></dd>
              <dd v-for = "(price,index) in priceFilter" @click = "setPriceFilter(index)">
                <a href="javascript:void(0)" v-bind:class = "{'cur':priceChecked==index}">{{price.startPrice}} - {{price.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              
              <ul>
                <li v-for = "(item,index) in goodsList">
                  <div class="pic">
                    <a href="#"><img v-bind:src="'/static/'+item.productImage" alt=""></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">${{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click = "addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="20">
                <img src="./../assets/loading/loading-bars.svg" v-show = "loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class = "md-overlay" v-show="overLayFlag" @click = "closePop"></div>
    <model v-bind:mdShow="mdShow" v-on:close="closeModel">
      <p slot = "message">
        Please Login First
      </p>
      <div slot = "btnGroup">
        <a class = "btn btn--m" href="javascript:;" @click="mdShow= false">Close</a>
      </div>

    </model>
    <model v-bind:mdShow="addShow" v-on:close="closeModel">
      <p slot = "message">
        Added Succeed
      </p>
      <div slot = "btnGroup">
        <a class = "btn btn--m" href="javascript:;" @click="addShow= false">Continue</a>
        <router-link class = "btn btn--m" href="javascript:;" to="/cart">Jump To Cart</router-link>
      </div>

    </model>
    <nav-footer></nav-footer>
  </div>
</template>

<script>
import './../assets/css/base.css'
import './../assets/css/product.css'
import './../assets/css/login.css'
import './../assets/css/checkout.css'

import NavHeader from '@/components/Header'
import NavFooter from '@/components/Footer'
import NavBread from '@/components/NavBread'
import Model from './../components/Model'
import axios from 'axios'

export default {
  components: {NavHeader,NavFooter,NavBread,Model},
  data() {
    return {
      goodsList:[],
      sortFlag: true,
      page:1,
      pageSize:4,
      busy: true,
      loading:false,
      mdShow:false,
      addShow:false,
      priceFilter: [
        {
          startPrice:'0.00',
          endPrice:'100.00'
        },
        {
          startPrice:'100.00',
          endPrice:'500.00'
        },
        {
          startPrice:'500.00',
          endPrice:'1000.00'
        },
        {
          startPrice:'1000.00',
          endPrice:'5000.00'
        }
      ],
      priceChecked:'all',
      priceFilterBy : false,
      overLayFlag : false
    };
  },
  mounted() {
    this.getGoodsList();
  },
  methods: {
    getGoodsList(flag){
      var param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag?1:-1,
        priceLevel:this.priceChecked
      }
      this.loading = true;
      axios.get("/goods",{params:param}).then((result)=>{
        let res = result.data;
        //console.log(res.result.list);
        this.loading = false;
        if(res.status == "0"){
          if(flag == true){
            this.goodsList = this.goodsList.concat(res.result.list);
            if(res.result.count < this.pageSize){
              this.busy = true;
            }else{
              this.busy = false;
            }
          }else{
            this.goodsList = res.result.list;
            this.busy = false;
          }
          
        }else{
          this.goodsList = [];
        }
        
      });
      
    },
    sortGoods(){
      this.sortFlag = !this.sortFlag;
      this.page = 1;
      this.getGoodsList();
    },
    showFilterPop(){
      this.priceFilterBy = true;
      this.overLayFlag = true;
    },
    closePop(){
      this.priceFilterBy = false;
      this.overLayFlag = false;
    },
    setPriceFilter(index){
      this.priceChecked = index;
      this.closePop();
      this.page = 1;
      this.getGoodsList();
    },
    loadMore(){
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 200);
    },
    addCart(productId){
      console.log(productId);
      let param = {productId: productId};
      axios.post("/goods/addCart",param).then((result)=>{
        let res = result.data;
        console.log(res.status);
        if(res.status == "0"){
          //alert("added to cart successfully");
          this.addShow = true;
          console.log(res.result);
        }else{
          this.mdShow = true;
        }
      })
    },
    closeModel(){
      this.mdShow = false;
      this.addShow = false;
    }
  },
};
</script>
<style scoped>
.wrapper{}
</style>

