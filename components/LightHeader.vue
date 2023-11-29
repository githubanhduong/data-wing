<script setup lang="ts"></script>

<template>
  <!-- header start -->
  <header class="light_header">
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="menu">
            <div class="brand-logo">
              <a href="../index.html">
                <img src="@/assets/images/Logo_Aviareps.png" alt="" class="float-start picicon" />
              </a>
            </div>
            <div class="d-flex d-flex-respon order-lg-2 ms-auto mt-1 mb-1">
              <label class="text-start text-logo-tiltle weight-bold me-3 d-flex style-select-drop-select">AVIA <span class="turquoise-colorheader">hub</span>
                <select class="select-office" tabindex="-1" aria-hidden="true">
                  <option value="AVIAAR">Argentina</option>
                  <option value="AVIAAU">Australia</option>
                  <option value="AVIAAT">Austria</option>
                  <option value="AVIAAZ">Azerbaijan</option>
                  <option value="AVIABE">Belgium</option>
                  <option value="AVIABR">Belize</option>
                </select>
              </label>
              <div class="main">
                <div class="subheader">
                  <div class="subheader__fac-select select d-flex">
                    <div class="icon__account_user-new text-center">
                      <span name="person" role="img" class="md hydrated" aria-label="person">
                        <img class="icon-substyle" src="@/assets/images/iconsubpage.png">
                      </span>
                    </div>
                    <span class="placeholder">Reservation</span>
                    <ul class="animated">
                      <li class="pt-1 pb-1">
                        <a class="subapp" href="/aviahub/secure/ibe/home">
                          <i class="me-1 fas fa-plane-departure"></i>&nbsp;&nbsp;Reservation </a>
                      </li>
                      <li class="pt-1 pb-1">
                        <a class="subapp" href="#">
                          <i class="me-1 fas fa-layer-group"></i>&nbsp;&nbsp;Administration </a>
                      </li>
                      <li class="pt-1 pb-1">
                        <a class="subapp" href="#">
                          <i class="me-1 fas fa-layer-group"></i>&nbsp;&nbsp;B2B back office&ZeroWidthSpace; </a>
                      </li>
                      <li class="pt-1 pb-1">
                        <a class="subapp" href="#">
                          <i class="me-1 fas fa-layer-group"></i>&nbsp;&nbsp;B2C back office&ZeroWidthSpace; </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="dropdown profile-dropdown ms-3">
                <a href="#" class="nav-link pe-0 leading-none d-flex  align-items-center" data-bs-toggle="dropdown">
                  <div class="icon__account_user-new text-center">
                    <span name="person" role="img" class="md hydrated" aria-label="person">
                      <img class="icon-substyle" src="@/assets/images/iconsettinguser.png">
                    </span>
                    <span class="circel-active"></span>
                  </div>
                  <span class="dropdown-item-span text-center user pb-0 ms-2">account04</span>
                </a>
                <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow animated dropdown-user">
                  <div class="text-start">
                    <a href="#" class="dropdown-item text-start ps-1 user pb-0 font-weight-bold">account04</a>
                    <div class="dropdown-divider"></div>
                  </div>
                  <div class="main pt-1 pb-1">
                    <div class="subheader">
                      <div class="subheader__fac-select select">
                        <div class="icon__account_user language-selected placeholder p-0">
                          <i class="fas fa-globe me-2"></i>
                          <span class="lang">English</span>
                        </div>
                        <ul class="language-ds setting-menu">
                          <li class="p-2 active" value="en" data-text="English">
                            <span class="fi fi-gb"></span>English
                          </li>
                          <li class="p-2" value="fr" data-text="French">
                            <span class="fi fi-fr"></span>French
                          </li>
                          <li class="p-2" value="de" data-text="German">
                            <span class="fi fi-de"></span>German
                          </li>
                          <li class="p-2" value="es" data-text="Spanish">
                            <span class="fi fi-es"></span>Spanish
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="dropdown-divider"></div>
                  </div>
                  <div class="text-start d-flex pb-1">
                    <a href="#" class="text-start ps-1 user pb-0 font-weight-bold">
                      <i class="fas fa-sign-out-alt mt-1 header-icon me-1 icon-f2x"></i>Logout
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- menu start -->
    <div class="horizontal-main hor-menu clearfix">
      <div class="horizontal-mainwrapper container clearfix">
        <nav class="nav__primary horizontalMenu">
          <div class="overlapblackbg"></div>
          <div class="overlapblackbg"></div>
          <div class="overlapblackbg"></div>
          <div class="nav__primary__links active">
            <ul id="menuElem" class="horizontalMenu-list">
              <li class="active">
                <a href="/aviahub/secure/home.htm" class="sub-icon active">
                  <i class="hor-icon fas fa-chart-line"></i>
                  <span class="side-menu__label">Dashboard</span>
                </a>
              </li>
              <li class="has-children">
                <a href="javascript:void(0)" class="sub-icon" data-animation="fadeIn">
                  <i class="hor-icon fas fa-edit"></i>
                  <span class="side-menu__label">Reports</span>
                  <i class="fas fa-chevron-down horizontal-icon"></i>
                </a>
                <div class="pane animated fadeIn">
                  <ul class="pane-section">
                    <li class="has-children child-menu">
                      <ul class="">
                        <li class="active">
                          <a href="/aviahub/secure/export/exportInternal.htm">TSR internal</a>
                        </li>
                        <li class="active">
                          <a href="/aviahub/secure/export/export.htm">TSR airline</a>
                        </li>
                        <li class="active linegr">
                          <a href="/aviahub/secure/TSRSummaryInternalOnline.htm">TSR Summary internal</a>
                        </li>
                        <li>
                          <a href="/aviahub/secure/TSRSummaryAirlineOnline.htm">TSR Summary airline</a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  <!-- menu end -->
  </header>
  <!--  header end -->
</template>
